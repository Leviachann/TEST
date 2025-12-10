using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.OrderLines.Handlers.CommandHandler;
using Application.CQRS.OrderLines.Handlers.ControllerHandler;
using Application.CQRS.OrderLines.Handlers.QueryHandler;
using Application.CQRS.OrderLines.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Moderator")]
public class OrderLinesController : ControllerBase
{
    private readonly AddOrderLineCommandHandler _addHandler;
    private readonly GetAllOrderLinesQueryHandler _getAllHandler;
    private readonly GetOrderLineByIdQueryHandler _getByIdHandler;
    private readonly FilterOrderLinesQueryHandler _filterHandler;
    private readonly UpdateOrderLineCommandHandler _updateHandler;
    private readonly DeleteOrderLineCommandHandler _deleteHandler;

    public OrderLinesController(
        AddOrderLineCommandHandler addHandler,
        GetAllOrderLinesQueryHandler getAllHandler,
        GetOrderLineByIdQueryHandler getByIdHandler,
        FilterOrderLinesQueryHandler filterHandler,
        UpdateOrderLineCommandHandler updateHandler,
        DeleteOrderLineCommandHandler deleteHandler)
    {
        _addHandler = addHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _filterHandler = filterHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddOrderLineCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllOrderLinesQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetOrderLineByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Order line with ID {id} not found" });

        return Ok(response);
    }

    [HttpPost("filter")]
    public async Task<IActionResult> Filter([FromBody] FilterOrderLinesQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrderLineCommandRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new { message = "ID mismatch between route and request body" });
        }

        var response = await _updateHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteOrderLineCommandRequest { Id = id };
        var response = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}