using Application.CQRS.Categories.Commands.Request;
using Application.CQRS.Categories.Handlers;
using Application.CQRS.Categories.Handlers.CommandHandlers;
using Application.CQRS.Categories.Handlers.QueryHandlers;
using Application.CQRS.Categories.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AddCategoryCommandHandler _addHandler;
    private readonly GetAllCategoriesQueryHandler _getAllHandler;
    private readonly GetCategoryByIdQueryHandler _getByIdHandler;
    private readonly FilterCategoriesQueryHandler _filterHandler;
    private readonly UpdateCategoryCommandHandler _updateHandler;
    private readonly DeleteCategoryCommandHandler _deleteHandler;

    public CategoriesController(
        AddCategoryCommandHandler addHandler,
        GetAllCategoriesQueryHandler getAllHandler,
        GetCategoryByIdQueryHandler getByIdHandler,
        FilterCategoriesQueryHandler filterHandler,
        UpdateCategoryCommandHandler updateHandler,
        DeleteCategoryCommandHandler deleteHandler)
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
    public async Task<IActionResult> Create([FromBody] AddCategoryCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllCategoriesQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetCategoryByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Category with ID {id} not found" });

        return Ok(response);
    }

    [HttpPost("filter")]
    [Authorize]
    public async Task<IActionResult> Filter([FromBody] FilterCategoriesQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryCommandRequest request)
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
        var request = new DeleteCategoryCommandRequest { Id = id };
        var response = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}