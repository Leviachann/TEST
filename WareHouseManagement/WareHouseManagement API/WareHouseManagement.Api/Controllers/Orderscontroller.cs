using Application.CQRS.Orders.Commands;
using Application.CQRS.Orders.Commands.Request;
using Application.CQRS.Orders.Handlers.CommandHandler;
using Application.CQRS.Orders.Handlers.QueryHandler;
using Application.CQRS.Orders.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Moderator")]
public class OrdersController : ControllerBase
{
    private readonly AddOrderCommandHandler _addHandler;
    private readonly GetAllOrdersQueryHandler _getAllHandler;
    private readonly GetOrderByIdQueryHandler _getByIdHandler;
    private readonly FilterOrdersQueryHandler _filterHandler;
    private readonly UpdateOrderCommandHandler _updateHandler;
    private readonly DeleteOrderCommandHandler _deleteHandler;

    public OrdersController(
        AddOrderCommandHandler addHandler,
        GetAllOrdersQueryHandler getAllHandler,
        GetOrderByIdQueryHandler getByIdHandler,
        FilterOrdersQueryHandler filterHandler,
        UpdateOrderCommandHandler updateHandler,
        DeleteOrderCommandHandler deleteHandler)
    {
        _addHandler = addHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _filterHandler = filterHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddOrderCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllOrdersQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetOrderByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Order with ID {id} not found" });

        return Ok(response);
    }

    [HttpPost("filter")]
    public async Task<IActionResult> Filter([FromBody] FilterOrdersQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrderCommandRequest request)
    {
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch between route and request body" });

        await _updateHandler.Handle(request, CancellationToken.None);
        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteOrderCommandRequest { Id = id };
        var response = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}