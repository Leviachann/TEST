using Domain.Enums;

namespace Application.CQRS.Orders.Commands.Request
{
    public class UpdateOrderCommandRequest
    {
        public Guid Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ArrivalTime { get; set; }

        public ArrivalStatus OrderArrivalStatus { get; set; } = ArrivalStatus.Pending;

        public Guid SupplierId { get; set; }

        public List<OrderLineUpdateDto> OrderLines { get; set; } = new();

        public class OrderLineUpdateDto
        {
            public Guid? Id { get; set; }
            public Guid ProductId { get; set; }
            public int QuantityOrdered { get; set; }
            public double PriceAtOrder { get; set; }
        }
    }
}
