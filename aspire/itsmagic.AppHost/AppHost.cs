using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

var enablePgAdmin = builder.Configuration.GetValue<bool>("EnablePgAdmin", true);
var appName = builder.Configuration.GetValue<string>("AppName", "itsmagic");
var installNpm = builder.Configuration.GetValue<bool>("InstallNpm", true);
var installPip = builder.Configuration.GetValue<bool>("InstallPip", true);

var postgres = builder.AddPostgres("postgres")
    .WithImageTag("17")
    .WithContainerName($"{appName}-postgres")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithHostPort(5444)
    .WithExternalHttpEndpoints()
    .WithDataVolume(isReadOnly: false);

if (enablePgAdmin)
{
    postgres
        .WithPgAdmin(pgAdmin =>
        {
            pgAdmin.WithImageTag("latest");
            pgAdmin.WithLifetime(ContainerLifetime.Persistent);
            pgAdmin.WithHostPort(5050);
            pgAdmin.WithExternalHttpEndpoints();
        }, $"{appName}-pgadmin");
}

var postgresdb = postgres.AddDatabase("postgresdb", "itsmagic");

var pyApp = builder
    .AddPythonApp($"{appName}be", "../../backend", "api.py")
    .WaitFor(postgresdb)
    .WithReference(postgresdb)
    .WithVirtualEnvironment("venv", true)
    .WithPip(installPip)
    .WithEnvironment("DbConn", postgresdb)
    .WithHttpEndpoint(env: "PORT", port: 8000)
    .WithExternalHttpEndpoints();

var jsApp = builder
    .AddJavaScriptApp($"{appName}fe", "../../frontend/itsmagicfe", "start")
    .WaitFor(pyApp)
    .WithReference(pyApp)
    .WithNpm(installNpm)
    .WithEnvironment("APP_NAME", appName)
    .WithHttpEndpoint(env: "PORT", port: 4200)
    .WithExternalHttpEndpoints();

await builder.Build().RunAsync();
