/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Breadcrumb,
  Tag,
  Drawer,
  Form,
  Input,
  InputNumber,
  App,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  LayoutOutlined,
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  DragOutlined,
  EnvironmentOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blueprintService } from '../api/blueprintService';
import { racksApi } from '../api/racks';
import type { Rack } from '../types/entities';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

type RackFormData = {
  id: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rows: number;
  grids: number;
};

type RackWithRotation = Rack & { rotation?: number };

const RACK_COLORS = [
  '#1890ff', 
  '#52c41a', 
  '#722ed1', 
  '#fa8c16', 
  '#eb2f96', 
  '#13c2c2', 
  '#faad14', 
  '#f5222d', 
];

export default function BlueprintDesigner() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedRack, setSelectedRack] = useState<RackWithRotation | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggingRack, setDraggingRack] = useState<RackWithRotation | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [hasCollision, setHasCollision] = useState(false);
  
  const [rackRotations, setRackRotations] = useState<Record<string, number>>({});

  const { data: blueprint } = useQuery({
    queryKey: ['blueprints', blueprintId],
    queryFn: () => blueprintService.getById(blueprintId!),
    enabled: !!blueprintId,
  });

  const { data: racks } = useQuery({
    queryKey: ['racks', blueprintId],
    queryFn: () => racksApi.getByBlueprintId(blueprintId!),
    enabled: !!blueprintId,
  });

  const racksWithRotation: RackWithRotation[] = racks?.map(rack => ({
    ...rack,
    rotation: rackRotations[rack.id] || 0,
  })) || [];

  const createMutation = useMutation({
    mutationFn: (data: RackFormData) =>
      racksApi.create({ ...data, blueprintId: blueprintId! } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      messageApi.success('Rack created successfully!');
      setIsAddDrawerOpen(false);
      addForm.resetFields();
      setClickPosition(null);
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      messageApi.error('Failed to create rack');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RackFormData }) =>
      racksApi.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      messageApi.success('Rack updated successfully!');
      setIsEditDrawerOpen(false);
      setSelectedRack(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      messageApi.error('Failed to update rack');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: racksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      messageApi.success('Rack deleted successfully!');
      setIsEditDrawerOpen(false);
      setSelectedRack(null);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      messageApi.error('Failed to delete rack');
    },
  });

  const snapToGrid = (value: number, gridSize: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const metersToPixels = (meters: number) => {
    return meters * 20 * scale;
  };

  const pixelsToMeters = (pixels: number) => {
    return pixels / (20 * scale);
  };

  const getEffectiveDimensions = (rack: RackWithRotation) => {
    const rotation = rack.rotation || 0;
    if (rotation === 90 || rotation === 270) {
      return { width: rack.height, height: rack.width };
    }
    return { width: rack.width, height: rack.height };
  };

  const checkCollision = (
    rack1: { x: number; y: number; width: number; height: number },
    rack2: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return !(
      rack1.x + rack1.width <= rack2.x ||
      rack2.x + rack2.width <= rack1.x ||
      rack1.y + rack1.height <= rack2.y ||
      rack2.y + rack2.height <= rack1.y
    );
  };

  const hasCollisionAtPosition = ( 
    x: number,
    y: number,
    width: number,
    height: number,
    excludeRackId?: string
  ): boolean => {
    if (!racksWithRotation) return false;

    return racksWithRotation.some(rack => {
      if (rack.id === excludeRackId) return false;
      
      const dims = getEffectiveDimensions(rack);
      return checkCollision(
        { x, y, width, height },
        { x: rack.positionX, y: rack.positionY, width: dims.width, height: dims.height }
      );
    });
  };

  const isValidRackSize = (width: number, height: number): boolean => {
    if (!blueprint) return false;
    return width <= blueprint.width && height <= blueprint.height;
  };

  const canFitRackAtPosition = (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeRackId?: string
  ): { canFit: boolean; reason?: string } => {
    if (!blueprint) return { canFit: false, reason: 'No blueprint loaded' };

    if (x + width > blueprint.width || y + height > blueprint.height) {
      return { canFit: false, reason: 'Rack extends beyond blueprint boundaries' };
    }

    if (x < 0 || y < 0) {
      return { canFit: false, reason: 'Position cannot be negative' };
    }

    const hasCollision = hasCollisionAtPosition(x, y, width, height, excludeRackId);
    if (hasCollision) {
      return { canFit: false, reason: 'Rack overlaps with another rack' };
    }

    return { canFit: true };
  };


const handleRotateRack = (rackId: string) => {
  const rack = racksWithRotation.find(r => r.id === rackId);
  if (!rack || !blueprint) return;

  const currentRotation = rack.rotation || 0;
  const newRotation = (currentRotation + 90) % 360;
  
  let newEffectiveWidth = rack.width;
  let newEffectiveHeight = rack.height;
  
  if (newRotation === 90 || newRotation === 270) {
    newEffectiveWidth = rack.height;
    newEffectiveHeight = rack.width;
  }
  
  if (rack.positionX + newEffectiveWidth > blueprint.width ||
      rack.positionY + newEffectiveHeight > blueprint.height) {
    messageApi.error(
      `Cannot rotate: Rack would extend beyond blueprint boundaries! ` +
      `Rotated size would be ${newEffectiveWidth}m × ${newEffectiveHeight}m at position (${rack.positionX}, ${rack.positionY})`
    );
    return;
  }
  
  const wouldCollide = hasCollisionAtPosition(
    rack.positionX,
    rack.positionY,
    newEffectiveWidth,
    newEffectiveHeight,
    rackId
  );
  
  if (wouldCollide) {
    messageApi.error(
      `Cannot rotate: Rack would overlap with another rack! ` +
      `Rotated dimensions: ${newEffectiveWidth}m × ${newEffectiveHeight}m`
    );
    return;
  }
  
  setRackRotations(prev => {
    return { ...prev, [rackId]: newRotation };
  });
  
  if (selectedRack && selectedRack.id === rackId) {
    setSelectedRack(prev =>
      prev ? { ...prev, rotation: newRotation } : null
    );
  }
  
  messageApi.success(`Rack rotated to ${newRotation}°`);
};

  useEffect(() => {
    if (!canvasRef.current || !blueprint) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);

    const gridSize = blueprint.gridSize / 100; 
    const gridPixels = metersToPixels(gridSize);
    const widthPixels = metersToPixels(blueprint.width);
    const heightPixels = metersToPixels(blueprint.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPixels, heightPixels);

    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;

    for (let x = 0; x <= widthPixels; x += gridPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, heightPixels);
      ctx.stroke();
    }

    for (let y = 0; y <= heightPixels; y += gridPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(widthPixels, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, widthPixels, heightPixels);

    racksWithRotation?.forEach((rack, index) => {
      const dims = getEffectiveDimensions(rack);
      
      if (isDragging && draggingRack?.id === rack.id && ghostPosition) {
        const x = metersToPixels(ghostPosition.x);
        const y = metersToPixels(ghostPosition.y);
        const w = metersToPixels(dims.width);
        const h = metersToPixels(dims.height);
        const color = RACK_COLORS[index % RACK_COLORS.length];

        ctx.fillStyle = hasCollision ? '#ff4d4f30' : color + '20';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = hasCollision ? '#ff4d4f' : color;
        ctx.lineWidth = hasCollision ? 3 : 2;
        ctx.setLineDash([5, 5]); 
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]); 
        
        ctx.fillStyle = hasCollision ? '#ff4d4f' : '#000000';
        ctx.font = `${Math.max(14, 14 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hasCollision ? 'Collision!' : 'Moving...', x + w / 2, y + h / 2);
        return;
      }

      const x = metersToPixels(rack.positionX);
      const y = metersToPixels(rack.positionY);
      const w = metersToPixels(dims.width);
      const h = metersToPixels(dims.height);

      const color = RACK_COLORS[index % RACK_COLORS.length];
      const isSelected = selectedRack?.id === rack.id;
      const isBeingDragged = isDragging && draggingRack?.id === rack.id;

      ctx.fillStyle = isBeingDragged ? color + '20' : color + '40';
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(x, y, w, h);

      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      
      const rotation = rack.rotation || 0;
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      ctx.fillStyle = '#000000';
      ctx.font = `${Math.max(12, 12 * scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rack.name, 0, -5 * scale);

      ctx.font = `${Math.max(10, 10 * scale)}px Arial`;
      ctx.fillStyle = '#666666';
      ctx.fillText(
        `${rack.width.toFixed(1)}m × ${rack.height.toFixed(1)}m`,
        0,
        10 * scale
      );

      ctx.fillText(
        `${rack.rows}R × ${rack.grids}G`,
        0,
        23 * scale
      );

      ctx.restore();

      if (rotation !== 0) {
        ctx.fillStyle = color;
        ctx.font = `${Math.max(12, 12 * scale)}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`${rotation}°`, x + 5, y + 15);
      }

      if (isSelected) {
        ctx.fillStyle = color;
        ctx.font = `${Math.max(16, 16 * scale)}px Arial`;
        ctx.fillText('⋮⋮', x + w - 15, y + 15);
      }
    });

    ctx.restore();
  }, [blueprint, racksWithRotation, scale, offset, selectedRack, isDragging, draggingRack, ghostPosition, hasCollision]);

  const findRackAtPosition = (x: number, y: number): RackWithRotation | null => {
    if (!racksWithRotation) return null;

    return racksWithRotation.find((rack) => {
      const dims = getEffectiveDimensions(rack);
      const rx = metersToPixels(rack.positionX);
      const ry = metersToPixels(rack.positionY);
      const rw = metersToPixels(dims.width);
      const rh = metersToPixels(dims.height);

      return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }) || null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!blueprint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;

    if (e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    const clickedRack = findRackAtPosition(x, y);

    if (clickedRack) {
      setIsDragging(true);
      setDraggingRack(clickedRack);
      setSelectedRack(clickedRack);
      
      const dims = getEffectiveDimensions(clickedRack);
      const rackX = metersToPixels(clickedRack.positionX);
      const rackY = metersToPixels(clickedRack.positionY);
      setDragOffset({
        x: x - rackX,
        y: y - rackY,
      });
      setGhostPosition({
        x: clickedRack.positionX,
        y: clickedRack.positionY,
      });
      setHasCollision(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!blueprint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;

    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientX - panStart.y,
      });
      return;
    }

    if (isDragging && draggingRack) {
      const newX = pixelsToMeters(x - dragOffset.x);
      const newY = pixelsToMeters(y - dragOffset.y);

      const gridSize = blueprint.gridSize / 100; 
      const snappedX = snapToGrid(newX, gridSize);
      const snappedY = snapToGrid(newY, gridSize);

      const dims = getEffectiveDimensions(draggingRack);
      const maxX = blueprint.width - dims.width;
      const maxY = blueprint.height - dims.height;
      const constrainedX = Math.max(0, Math.min(snappedX, maxX));
      const constrainedY = Math.max(0, Math.min(snappedY, maxY));

      const collision = hasCollisionAtPosition(
        constrainedX,
        constrainedY,
        dims.width,
        dims.height,
        draggingRack.id
      );
      
      setHasCollision(collision);
      setGhostPosition({
        x: constrainedX,
        y: constrainedY,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging && draggingRack && ghostPosition) {
      if (!hasCollision &&
        (ghostPosition.x !== draggingRack.positionX ||
         ghostPosition.y !== draggingRack.positionY)
      ) {
        updateMutation.mutate({
          id: draggingRack.id,
          data: {
            id: draggingRack.id,
            name: draggingRack.name,
            positionX: ghostPosition.x,
            positionY: ghostPosition.y,
            width: draggingRack.width,
            height: draggingRack.height,
            rows: draggingRack.rows,
            grids: draggingRack.grids,
          },
        });
      } else if (hasCollision) {
        messageApi.warning('Cannot place rack here - overlaps with another rack!');
      }

      setIsDragging(false);
      setDraggingRack(null);
      setGhostPosition(null);
      setDragOffset({ x: 0, y: 0 });
      setHasCollision(false);
      return;
    }

    if (!isDragging) {
      handleCanvasClick(e);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!blueprint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;

    const clickedRack = findRackAtPosition(x, y);

    if (clickedRack) {
      setSelectedRack(clickedRack);
      setIsEditDrawerOpen(true);
      editForm.setFieldsValue({
        name: clickedRack.name,
        positionX: clickedRack.positionX,
        positionY: clickedRack.positionY,
        width: clickedRack.width,
        height: clickedRack.height,
        rows: clickedRack.rows,
        grids: clickedRack.grids,
      });
    } else {
      const posX = pixelsToMeters(x);
      const posY = pixelsToMeters(y);
      
      const gridSize = blueprint.gridSize / 100;
      const snappedX = snapToGrid(posX, gridSize);
      const snappedY = snapToGrid(posY, gridSize);
      
      setClickPosition({ x: snappedX, y: snappedY });
      setIsAddDrawerOpen(true);
      addForm.setFieldsValue({
        positionX: Math.max(0, snappedX),
        positionY: Math.max(0, snappedY),
        width: 3.5,
        height: 4.0,
        rows: 4,
        grids: 8,
      });
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleAddSubmit = async (values: RackFormData) => {
    if (!blueprint) return;

    if (!isValidRackSize(values.width, values.height)) {
      messageApi.error(
        `Rack size (${values.width}m × ${values.height}m) exceeds blueprint dimensions (${blueprint.width}m × ${blueprint.height}m)!`
      );
      return;
    }

    const gridSize = blueprint.gridSize / 100;
    const snappedValues = {
      ...values,
      positionX: snapToGrid(values.positionX, gridSize),
      positionY: snapToGrid(values.positionY, gridSize),
    };

    const fitCheck = canFitRackAtPosition(
      snappedValues.positionX,
      snappedValues.positionY,
      snappedValues.width,
      snappedValues.height
    );

    if (!fitCheck.canFit) {
      messageApi.error(`Cannot create rack: ${fitCheck.reason}`);
      return;
    }

    createMutation.mutate(snappedValues);
  };

  const handleEditSubmit = async (values: RackFormData) => {
    if (!selectedRack || !blueprint) return;

    if (!isValidRackSize(values.width, values.height)) {
      messageApi.error(
        `Rack size (${values.width}m × ${values.height}m) exceeds blueprint dimensions (${blueprint.width}m × ${blueprint.height}m)!`
      );
      return;
    }

    const gridSize = blueprint.gridSize / 100;
    const snappedValues = {
      ...values,
      positionX: snapToGrid(values.positionX, gridSize),
      positionY: snapToGrid(values.positionY, gridSize),
    };

    const fitCheck = canFitRackAtPosition(
      snappedValues.positionX,
      snappedValues.positionY,
      snappedValues.width,
      snappedValues.height,
      selectedRack.id
    );

    if (!fitCheck.canFit) {
      messageApi.error(`Cannot update rack: ${fitCheck.reason}`);
      return;
    }

    updateMutation.mutate({
      id: selectedRack.id,
      data: { ...snappedValues, id: selectedRack.id },
    });
  };

  const handleDeleteRack = () => {
    if (selectedRack) {
      deleteMutation.mutate(selectedRack.id);
      setRackRotations(prev => {
        const newRotations = { ...prev };
        delete newRotations[selectedRack.id];
        return newRotations;
      });
    }
  };

const RackFormFields = ({ isEdit = false }: { isEdit?: boolean }) => {
  const formInstance = isEdit ? editForm : addForm;
  
  const getEffectiveFormDimensions = () => {
    if (!isEdit || !selectedRack) {
      return {
        effectiveWidth: formInstance.getFieldValue('width'),
        effectiveHeight: formInstance.getFieldValue('height'),
      };
    }
    
    const rotation = selectedRack.rotation || 0;
    const width = formInstance.getFieldValue('width');
    const height = formInstance.getFieldValue('height');
    
    if (rotation === 90 || rotation === 270) {
      return {
        effectiveWidth: height,
        effectiveHeight: width,
      };
    }
    
    return {
      effectiveWidth: width,
      effectiveHeight: height,
    };
  };
  
  return (
    <>
      <Form.Item
        label="Rack Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter rack name' },
          { min: 2, message: 'Name must be at least 2 characters' },
        ]}
      >
        <Input placeholder="e.g., Pallet Rack A1" prefix={<AppstoreOutlined />} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Position X (m)"
            name="positionX"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, message: 'Must be positive' },
              {
                validator: async (_, value) => {
                  const { effectiveWidth } = getEffectiveFormDimensions();
                  if (value !== undefined && effectiveWidth && blueprint) {
                    if (value + effectiveWidth > blueprint.width) {
                      const rotation = selectedRack?.rotation || 0;
                      const rotationNote = (rotation === 90 || rotation === 270) 
                        ? ` (rotated ${rotation}°, using height as width)` 
                        : '';
                      throw new Error(
                        `Rack will extend beyond blueprint${rotationNote} (max X: ${(blueprint.width - effectiveWidth).toFixed(1)}m)`
                      );
                    }
                  }
                },
              },
            ]}
            tooltip={
              isEdit && selectedRack && (selectedRack.rotation === 90 || selectedRack.rotation === 270)
                ? `Rotated ${selectedRack.rotation}° - using HEIGHT as effective width`
                : "Will snap to nearest grid"
            }
          >
            <InputNumber
              placeholder="X"
              min={0}
              max={blueprint ? blueprint.width : undefined}
              step={blueprint?.gridSize ? blueprint.gridSize / 100 : 0.5}
              style={{ width: '100%' }}
              addonAfter="m"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Position Y (m)"
            name="positionY"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, message: 'Must be positive' },
              {
                validator: async (_, value) => {
                  const { effectiveHeight } = getEffectiveFormDimensions();
                  if (value !== undefined && effectiveHeight && blueprint) {
                    if (value + effectiveHeight > blueprint.height) {
                      const rotation = selectedRack?.rotation || 0;
                      const rotationNote = (rotation === 90 || rotation === 270) 
                        ? ` (rotated ${rotation}°, using width as height)` 
                        : '';
                      throw new Error(
                        `Rack will extend beyond blueprint${rotationNote} (max Y: ${(blueprint.height - effectiveHeight).toFixed(1)}m)`
                      );
                    }
                  }
                },
              },
            ]}
            tooltip={
              isEdit && selectedRack && (selectedRack.rotation === 90 || selectedRack.rotation === 270)
                ? `Rotated ${selectedRack.rotation}° - using WIDTH as effective height`
                : "Will snap to nearest grid"
            }
          >
            <InputNumber
              placeholder="Y"
              min={0}
              max={blueprint ? blueprint.height : undefined}
              step={blueprint?.gridSize ? blueprint.gridSize / 100 : 0.5}
              style={{ width: '100%' }}
              addonAfter="m"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Width (m)"
            name="width"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0.5, message: 'Min 0.5m' },
              {
                validator: async (_, value) => {
                  if (value && blueprint && value > blueprint.width) {
                    throw new Error(`Width cannot exceed blueprint width (${blueprint.width}m)`);
                  }
                  const posX = formInstance.getFieldValue('positionX');
                  if (value && posX !== undefined && blueprint) {
                    const { effectiveWidth } = getEffectiveFormDimensions();
                    if (posX + effectiveWidth > blueprint.width) {
                      const rotation = selectedRack?.rotation || 0;
                      const note = (rotation === 90 || rotation === 270) 
                        ? ' (considering rotation)' 
                        : '';
                      throw new Error(`Rack will extend beyond blueprint at this position${note}`);
                    }
                  }
                },
              },
            ]}
            tooltip="Maximum width is blueprint width"
          >
            <InputNumber
              placeholder="Width"
              min={0.5}
              max={blueprint ? blueprint.width : undefined}
              step={0.5}
              style={{ width: '100%' }}
              addonAfter="m"
              onChange={() => {
                formInstance.validateFields(['positionX', 'positionY']);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Height (m)"
            name="height"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0.5, message: 'Min 0.5m' },
              {
                validator: async (_, value) => {
                  if (value && blueprint && value > blueprint.height) {
                    throw new Error(`Height cannot exceed blueprint height (${blueprint.height}m)`);
                  }
                  const posY = formInstance.getFieldValue('positionY');
                  if (value && posY !== undefined && blueprint) {
                    const { effectiveHeight } = getEffectiveFormDimensions();
                    if (posY + effectiveHeight > blueprint.height) {
                      const rotation = selectedRack?.rotation || 0;
                      const note = (rotation === 90 || rotation === 270) 
                        ? ' (considering rotation)' 
                        : '';
                      throw new Error(`Rack will extend beyond blueprint at this position${note}`);
                    }
                  }
                },
              },
            ]}
            tooltip="Maximum height is blueprint height"
          >
            <InputNumber
              placeholder="Height"
              min={0.5}
              max={blueprint ? blueprint.height : undefined}
              step={0.5}
              style={{ width: '100%' }}
              addonAfter="m"
              onChange={() => {
                formInstance.validateFields(['positionX', 'positionY']);
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Rows"
            name="rows"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 1, max: 20, message: '1-20' },
            ]}
          >
            <InputNumber placeholder="Rows" min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Grids"
            name="grids"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 1, max: 30, message: '1-30' },
            ]}
          >
            <InputNumber placeholder="Grids" min={1} max={30} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff', marginBottom: '16px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: '12px' }}>Blueprint Constraints:</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            • Max Width: {blueprint?.width}m | Max Height: {blueprint?.height}m
          </Text>
          {isEdit && selectedRack && (selectedRack.rotation === 90 || selectedRack.rotation === 270) && (
            <Text type="warning" style={{ fontSize: '12px' }}>
              • Rack rotated {selectedRack.rotation}° - dimensions are swapped!
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: '12px' }}>
            • Rack must fit within blueprint boundaries
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            • Cannot overlap with other racks
          </Text>
        </Space>
      </Card>

      {isEdit && (
        <>
          {selectedRack && (
            <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space direction="vertical" size={0}>
                    <Text strong>Rotation: {selectedRack.rotation || 0}°</Text>
                    {(selectedRack.rotation === 90 || selectedRack.rotation === 270) && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Effective: {formInstance.getFieldValue('height')}m × {formInstance.getFieldValue('width')}m
                      </Text>
                    )}
                  </Space>
                  <Button
                    icon={<RotateRightOutlined />}
                    onClick={() => {
                      handleRotateRack(selectedRack.id);
                      setTimeout(() => {
                        formInstance.validateFields(['positionX', 'positionY']);
                      }, 100);
                    }}
                    className="custom-button-default"
                  >
                    Rotate 90°
                  </Button>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Rotation swaps width↔height for collision checking
                </Text>
              </Space>
            </Card>
          )}
        </>
      )}
    </>
  );
};
  if (!blueprint) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Loading blueprint...</Text>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
       <style>{`
      .custom-button-primary:hover {
        background-color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
      }
      .custom-button-default:hover {
        color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
      }
    `}</style>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Breadcrumb
              items={[
                {
                  title: (
                    <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                      <HomeOutlined /> Home
                    </span>
                  ),
                },
                {
                  title: (
                    <span onClick={() => navigate('/blueprints')} style={{ cursor: 'pointer' }}>
                      <LayoutOutlined /> Blueprints
                    </span>
                  ),
                },
                {
                  title: 'Designer',
                },
              ]}
              style={{ marginBottom: '16px' }}
            />

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <Title level={2}>Blueprint Designer: {blueprint.name}</Title>
                <Space>
                  <Text type="secondary">
                    Dimensions: {blueprint.width}m × {blueprint.height}m
                  </Text>
                  <Divider type="vertical" />
                  <Text type="secondary">Grid: {blueprint.gridSize}cm</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">Zoom: {(scale * 100).toFixed(0)}%</Text>
                </Space>
              </div>

              <Space>
                <Button
                  className="custom-button-default"
                  icon={<ZoomOutOutlined />}
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                >
                  Zoom Out
                </Button>
                <Button className="custom-button-default" icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={scale >= 3}>
                  Zoom In
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsAddDrawerOpen(true);
                    addForm.resetFields();
                    addForm.setFieldsValue({
                      width: 3.5,
                      height: 4.0,
                      rows: 4,
                      grids: 8,
                      positionX: 5,
                      positionY: 5,
                    });
                  }}
                  
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Add Rack
                </Button>
              </Space>
            </div>
          </Card>

          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Racks"
                  value={racksWithRotation?.length || 0}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Locations"
                  value={racksWithRotation?.reduce((sum, rack) => sum + rack.locationCount, 0) || 0}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Floor Coverage"
                  value={
                    racksWithRotation
                      ? (
                          (racksWithRotation.reduce((sum, r) => sum + r.width * r.height, 0) /
                            (blueprint.width * blueprint.height)) *
                          100
                        ).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <Text strong>Warehouse Layout</Text>
                <Tag color="blue">Click empty space to add</Tag>
                <Tag color="green">Drag to move</Tag>
                <Tag color="purple">Auto-snaps to grid</Tag>
                <Tag color="orange">Collision detection</Tag>
              </Space>
            }
          >
            {hasCollision && isDragging && (
              <Alert
                message="Collision Detected"
                description="Cannot place rack here - it overlaps with another rack!"
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#fafafa',
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
              }}
            >
              <canvas
                ref={canvasRef}
                width={1600}
                height={900}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  setIsPanning(false);
                  setIsDragging(false);
                  setDraggingRack(null);
                  setGhostPosition(null);
                  setHasCollision(false);
                }}
                style={{
                  border: '2px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: isPanning
                    ? 'grabbing'
                    : isDragging
                    ? hasCollision
                      ? 'not-allowed'
                      : 'move'
                    : 'pointer',
                  background: '#ffffff',
                }}
              />
            </div>
          </Card>

          <Card title="Racks in this Blueprint">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {racksWithRotation?.length === 0 && (
                <Text type="secondary">No racks yet. Click on the canvas to add one!</Text>
              )}
              {racksWithRotation?.map((rack, index) => (
                <Card
                  key={rack.id}
                  size="small"
                  style={{
                    borderLeft: `4px solid ${RACK_COLORS[index % RACK_COLORS.length]}`,
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={5}>
                      <Space>
                        <DragOutlined style={{ color: '#999' }} />
                        <Text strong style={{ fontSize: '16px' }}>
                          {rack.name}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={3}>
                      <Text type="secondary">
                        ({rack.positionX.toFixed(1)}, {rack.positionY.toFixed(1)})
                      </Text>
                    </Col>
                    <Col span={3}>
                      <Text type="secondary">
                        {rack.width}m × {rack.height}m
                      </Text>
                    </Col>
                    <Col span={3}>
                      <Tag color="blue">
                        {rack.rows}R × {rack.grids}G
                      </Tag>
                    </Col>
                    <Col span={3}>
                      <Tag color="green">{rack.locationCount} locations</Tag>
                    </Col>
                    <Col span={2}>
                      {rack.rotation ? (
                        <Tag color="purple" icon={<RotateRightOutlined />}>
                          {rack.rotation}°
                        </Tag>
                      ) : (
                        <Tag color="default">0°</Tag>
                      )}
                    </Col>
                    <Col span={5}>
                      <Space>
                        <Tooltip title="Rotate 90°">
                          <Button
                            size="small"
                            icon={<RotateRightOutlined />}
                            onClick={() => handleRotateRack(rack.id)}
                            className="custom-button-default"
                          />
                        </Tooltip>
                        <Tooltip title="Edit">
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedRack(rack);
                              setIsEditDrawerOpen(true);
                              editForm.setFieldsValue({
                                name: rack.name,
                                positionX: rack.positionX,
                                positionY: rack.positionY,
                                width: rack.width,
                                height: rack.height,
                                rows: rack.rows,
                                grids: rack.grids,
                              });
                            }}
                            className="custom-button-default"
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setSelectedRack(rack);
                              handleDeleteRack();
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Space>

        <Drawer
          title="Add New Rack"
          placement="right"
          width={500}
          onClose={() => {
            setIsAddDrawerOpen(false);
            addForm.resetFields();
            setClickPosition(null);
          }}
          open={isAddDrawerOpen}
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddSubmit}
            initialValues={{
              width: 3.5,
              height: 4.0,
              rows: 4,
              grids: 8,
              positionX: 5,
              positionY: 5,
            }}
          >
            <RackFormFields />

            <Divider />

            <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
              <Text type="secondary">
                 Position snaps to grid ({blueprint.gridSize}cm). Collision detection active!
              </Text>
            </Card>

            <Form.Item style={{ marginTop: '16px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setIsAddDrawerOpen(false);
                    addForm.resetFields();
                    setClickPosition(null);
                  }}
                  className="custom-button-default"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createMutation.isPending}
                  
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Create Rack
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Drawer>

    <Divider />

        <Drawer
          title={`Edit Rack: ${selectedRack?.name || ""}`}
          placement="right"
          width={500}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setSelectedRack(null);
            editForm.resetFields();
          }}
          open={isEditDrawerOpen}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <RackFormFields isEdit />

            <Divider />

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteRack}
                >
                  Delete Rack
                </Button>

                <Space>
                  <Button
                    onClick={() => {
                      setIsEditDrawerOpen(false);
                      setSelectedRack(null);
                      editForm.resetFields();
                    }}
                    className="custom-button-default"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateMutation.isPending}
                    style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                  >
                    Update Rack
                  </Button>
                </Space>
              </Space>
            </Form.Item>
          </Form>
        </Drawer>

      </div>
    </div>
  );
}