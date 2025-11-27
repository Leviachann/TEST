import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Protectedroute';
import MainLayout from './components/Mainlayout';
import Categories from './pages/Category';
import Products from './pages/Product';
import Suppliers from './pages/Supplier';
import Inventories from './pages/Inventory';
import Orders from './pages/Orders';
import Locations from './pages/Location';
import Blueprints from './pages/Blueprints';
import BlueprintRacks from './pages/BlueprintRacks';
import BlueprintDesigner from './pages/BlueprintDesigner';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute >
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/blueprints" element={<Blueprints />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="inventories" element={<Inventories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="locations" element={<Locations />} />
              <Route path="/blueprints" element={<Blueprints />} />
              <Route
                path="blueprints/:blueprintId/designer"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <BlueprintDesigner />
                  </ProtectedRoute>
                }
              />
              <Route path="/blueprints/:blueprintId/racks" element={<BlueprintRacks />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;