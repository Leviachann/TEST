using Domain.Enums;

namespace Application.CQRS.Orders.Commands
{
    public class AddOrderCommandRequest
    {
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ArrivalTime { get; set; }

        public ArrivalStatus OrderArrivalStatus { get; set; } = ArrivalStatus.Pending; 

        public Guid SupplierId { get; set; }

        public List<OrderLineDto> OrderLines { get; set; } = new(); 

        public class OrderLineDto
        {
            public Guid ProductId { get; set; }
            public int QuantityOrdered { get; set; }
            public double PriceAtOrder { get; set; }
        }
    }
}
