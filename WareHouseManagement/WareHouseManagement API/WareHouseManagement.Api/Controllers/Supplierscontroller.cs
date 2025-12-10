using Application.CQRS.Suppliers.Commands.Request;
using Application.CQRS.Suppliers.Handlers.CommandHandler;
using Application.CQRS.Suppliers.Handlers.QueryHandler;
using Application.CQRS.Suppliers.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly AddSupplierCommandHandler _addHandler;
    private readonly GetAllSuppliersQueryHandler _getAllHandler;
    private readonly GetSupplierByIdQueryHandler _getByIdHandler;
    private readonly FilterSuppliersQueryHandler _filterHandler;
    private readonly UpdateSupplierCommandHandler _updateHandler;
    private readonly DeleteSupplierCommandHandler _deleteHandler;

    public SuppliersController(
        AddSupplierCommandHandler addHandler,
        GetAllSuppliersQueryHandler getAllHandler,
        GetSupplierByIdQueryHandler getByIdHandler,
        FilterSuppliersQueryHandler filterHandler,
        UpdateSupplierCommandHandler updateHandler,
        DeleteSupplierCommandHandler deleteHandler)
    {
        _addHandler = addHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _filterHandler = filterHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] AddSupplierCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllSuppliersQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetSupplierByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Supplier with ID {id} not found" });

        return Ok(response);
    }

    [HttpPost("filter")]
    [Authorize]
    public async Task<IActionResult> Filter([FromBody] FilterSuppliersQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierCommandRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new { message = "ID mismatch between route and request body" });
        }

        var response = await _updateHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteSupplierCommandRequest { Id = id };
        var response = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}