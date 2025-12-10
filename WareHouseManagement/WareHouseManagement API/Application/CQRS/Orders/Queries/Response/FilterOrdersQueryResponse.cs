using Domain.Enums;

namespace Application.CQRS.Orders.Queries.Response
{
    public class OrderResponse
    {
        public Guid Id { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ArrivalTime { get; set; }
        public ArrivalStatus OrderArrivalStatus { get; set; }
        public Guid SupplierId { get; set; }

        public List<OrderLineDto> OrderLines { get; set; } = new();

        public class OrderLineDto
        {
            public Guid Id { get; set; }
            public Guid ProductId { get; set; }
            public int QuantityOrdered { get; set; }
            public double PriceAtOrder { get; set; }
        }
    }
}
