using Application.CQRS.Products.Commands.Request;
using Application.CQRS.Products.Handlers.CommandHandler;
using Application.CQRS.Products.Handlers.QueryHandler;
using Application.CQRS.Products.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AddProductCommandHandler _addHandler;
    private readonly GetAllProductsQueryHandler _getAllHandler;
    private readonly GetProductByIdQueryHandler _getByIdHandler;
    private readonly GetProductsByCategoryQueryHandler _getByCategoryHandler;
    private readonly GetProductsBySupplierQueryHandler _getBySupplierHandler;
    private readonly FilterProductsQueryHandler _filterHandler;
    private readonly UpdateProductCommandHandler _updateHandler;
    private readonly DeleteProductCommandHandler _deleteHandler;

    public ProductsController(
        AddProductCommandHandler addHandler,
        GetAllProductsQueryHandler getAllHandler,
        GetProductByIdQueryHandler getByIdHandler,
        GetProductsByCategoryQueryHandler getByCategoryHandler,
        GetProductsBySupplierQueryHandler getBySupplierHandler,
        FilterProductsQueryHandler filterHandler,
        UpdateProductCommandHandler updateHandler,
        DeleteProductCommandHandler deleteHandler)
    {
        _addHandler = addHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _getByCategoryHandler = getByCategoryHandler;
        _getBySupplierHandler = getBySupplierHandler;
        _filterHandler = filterHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] AddProductCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllProductsQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetProductByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Product with ID {id} not found" });

        return Ok(response);
    }

    [HttpGet("category/{categoryId}")]
    [Authorize]
    public async Task<IActionResult> GetByCategory(Guid categoryId)
    {
        var request = new GetProductsByCategoryQueryRequest { CategoryId = categoryId };
        var response = await _getByCategoryHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("supplier/{supplierId}")]
    [Authorize]
    public async Task<IActionResult> GetBySupplier(Guid supplierId)
    {
        var request = new GetProductsBySupplierQueryRequest { SupplierId = supplierId };
        var response = await _getBySupplierHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPost("filter")]
    [Authorize]
    public async Task<IActionResult> Filter([FromBody] FilterProductsQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductCommandRequest request)
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
        var request = new DeleteProductCommandRequest { Id = id };
        var response = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}