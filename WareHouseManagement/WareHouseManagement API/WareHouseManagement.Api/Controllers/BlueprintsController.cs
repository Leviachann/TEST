using Application.CQRS.Blueprints.Commands.Request;
using Application.CQRS.Blueprints.Handlers.CommandHandler;
using Application.CQRS.Blueprints.Handlers.QueryHandler;
using Application.CQRS.Blueprints.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlueprintsController : ControllerBase
{
    private readonly AddBlueprintCommandHandler _addHandler;
    private readonly UpdateBlueprintCommandHandler _updateHandler;
    private readonly DeleteBlueprintCommandHandler _deleteHandler;
    private readonly GetAllBlueprintsQueryHandler _getAllHandler;
    private readonly GetByIdBlueprintQueryHandler _getByIdHandler;

    public BlueprintsController(
        AddBlueprintCommandHandler addHandler,
        UpdateBlueprintCommandHandler updateHandler,
        DeleteBlueprintCommandHandler deleteHandler,
        GetAllBlueprintsQueryHandler getAllHandler,
        GetByIdBlueprintQueryHandler getByIdHandler)
    {
        _addHandler = addHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Create([FromBody] AddBlueprintCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllBlueprintsQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetByIdBlueprintQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Blueprint with ID {id} not found" });

        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBlueprintCommandRequest request)
    {
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch between route and body" });

        await _updateHandler.Handle(request, CancellationToken.None);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteBlueprintCommandRequest { Id = id };
        var result = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(result);
    }
}