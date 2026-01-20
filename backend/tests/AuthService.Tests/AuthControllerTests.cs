using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AuthService.Controllers;
using AuthService.Data;
using AuthService.Models;
using AuthService.DTOs;
using AuthService.Enums;
using System.Threading.Tasks;

namespace AuthService.Tests;

// Prueba de integración
public class AuthControllerTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly AppDbContext _context;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        // Iniciar base de datos en memoria
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb")
            .Options;
        _context = new AppDbContext(options);

        // Mockear configuración
        _mockConfig = new Mock<IConfiguration>();
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Key").Value).Returns("SuperSecretKeyForTestingPurposesOnly123!SuperSecretKeyForTestingPurposesOnly123!");
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Issuer").Value).Returns("TestIssuer");
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Audience").Value).Returns("TestAudience");

        _controller = new AuthController(_context, _mockConfig.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenUserIsValid()
    {
        // Limpiar DB o usar un ID único si es necesario
        // Pero InMemory persiste. Mejor borrar todos los usuarios antes del test o usar DB única
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        var request = new UserRegisterDto 
        { 
            Username = "testuser_reg", 
            Password = "password123",
            Role = UserRole.Customer
        };

        var result = await _controller.Register(request);

        // Afirmar
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal("Usuario registrado exitosamente.", okResult.Value);
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenUserExists()
    {
        // Arrange
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        _context.Users.Add(new User { Username = "existinguser", PasswordHash = "hash", Role = UserRole.Customer });
        await _context.SaveChangesAsync();

        var request = new UserRegisterDto { Username = "existinguser", Password = "password123", Role = UserRole.Customer };

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("El usuario ya existe.", badRequestResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsOkWithToken_WhenCredentialsAreCorrect()
    {
        // Arrange
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        _context.Users.Add(new User { Username = "loginuser", PasswordHash = hashedPassword, Role = UserRole.Admin });
        await _context.SaveChangesAsync();

        var loginDto = new UserLoginDto { Username = "loginuser", Password = "correctpassword" };

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var token = Assert.IsType<string>(okResult.Value);
        Assert.False(string.IsNullOrEmpty(token));
    }

    [Fact]
    public async Task Login_ReturnsBadRequest_WhenUserNotFound()
    {
        // Arrange
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        var loginDto = new UserLoginDto { Username = "nonexistent", Password = "password" };

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Usuario no encontrado.", badRequestResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsBadRequest_WhenPasswordIsIncorrect()
    {
        // Arrange
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        _context.Users.Add(new User { Username = "wrongpassuser", PasswordHash = hashedPassword, Role = UserRole.Admin });
        await _context.SaveChangesAsync();

        var loginDto = new UserLoginDto { Username = "wrongpassuser", Password = "wrongpassword" };

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Contraseña incorrecta.", badRequestResult.Value);
    }
}
