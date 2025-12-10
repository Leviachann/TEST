using Application.CQRS.Categories.Handlers;
using Application.CQRS.Categories.Handlers.CommandHandlers;
using Application.CQRS.Inventories.Commands.Request;
using Application.CQRS.Inventories.Handlers.CommandHandlers;
using Application.CQRS.Inventories.Handlers.QueryHandler;
using Application.CQRS.Inventories.Queries.Request;
using Application.CQRS.Inventories.Query.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoriesController : ControllerBase
{
    private readonly AddInventoryCommandHandler _addHandler;
    private readonly UpdateInventoriesCommandHandler _updateHandler;
    private readonly DeleteInventoriesCommandHandler _deleteHandler;
    private readonly GetAllInventoriesQueryHandler _getAllHandler;
    private readonly GetByIdInventoryQueryHandler _getByIdHandler;
    private readonly GetByProductIdInventoryQueryHandler _getByProductIdHandler;

    public InventoriesController(
        AddInventoryCommandHandler addHandler,
        UpdateInventoriesCommandHandler updateHandler,
        DeleteInventoriesCommandHandler deleteHandler,
        GetAllInventoriesQueryHandler getAllHandler,
        GetByIdInventoryQueryHandler getByIdHandler,
        GetByProductIdInventoryQueryHandler getByProductIdHandler)
    {
        _addHandler = addHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _getByProductIdHandler = getByProductIdHandler;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] AddInventoriesCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllInventoriesQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetInventoryByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Inventory with ID {id} not found" });

        return Ok(response);
    }

    [HttpGet("product/{productId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByProductId(Guid productId)
    {
        var request = new GetByProductInventoryQueryRequest { ProductId = productId };
        var response = await _getByProductIdHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoriesCommandRequest request)
    {
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch between route and body" });

        await _updateHandler.Handle(request, CancellationToken.None);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteInventoriesCommandRequest { Id = id };
        var result = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(result);
    }
}