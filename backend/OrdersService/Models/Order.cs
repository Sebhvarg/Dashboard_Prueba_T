namespace OrdersService.Models;

using OrdersService.enums;


public class Order
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public StateOrder Status { get; set; } = StateOrder.Pending;
    public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

}
