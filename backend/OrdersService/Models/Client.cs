namespace OrdersService.Models;
using OrdersService.enums;
using System.Text.Json.Serialization;

public class Client
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StatusClient Status { get; set; } = StatusClient.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
