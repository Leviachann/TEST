using Application.CQRS.Locations.Commands.Request;
using Application.CQRS.Locations.Handlers.CommandHandler;
using Application.CQRS.Locations.Handlers.QueryHandler;
using Application.CQRS.Locations.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly AddLocationCommandHandler _addHandler;
    private readonly UpdateLocationCommandHandler _updateHandler;
    private readonly DeleteLocationCommandHandler _deleteHandler;
    private readonly GetAllLocationsQueryHandler _getAllHandler;
    private readonly GetByIdLocationQueryHandler _getByIdHandler;
    private readonly FilterLocationsQueryHandler _filterHandler;

    public LocationsController(
        AddLocationCommandHandler addHandler,
        UpdateLocationCommandHandler updateHandler,
        DeleteLocationCommandHandler deleteHandler,
        GetAllLocationsQueryHandler getAllHandler,
        GetByIdLocationQueryHandler getByIdHandler,
        FilterLocationsQueryHandler filterHandler)
    {
        _addHandler = addHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _filterHandler = filterHandler;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Create([FromBody] AddLocationCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllLocationsQueryRequest();
        var response = await _getAllHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetByIdLocationQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"Location with ID {id} not found" });

        return Ok(response);
    }

    [HttpPost("filter")]
    [Authorize]
    public async Task<IActionResult> Filter([FromBody] FilterLocationsQueryRequest request)
    {
        var response = await _filterHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLocationCommandRequest request)
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
        var request = new DeleteLocationCommandRequest { Id = id };
        var result = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(result);
    }
}