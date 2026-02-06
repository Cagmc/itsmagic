var builder = DistributedApplication.CreateBuilder(args);

var enablePgAdmin = true;

var postgres = builder.AddPostgres("postgres")
    .WithImageTag("17")
    .WithContainerName("itsmagic-postgres")
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
        }, "itsmagic-pgadmin");
}

var postgresdb = postgres.AddDatabase("postgresdb", "itsmagic");

var pyApp = builder
    .AddPythonApp("itsmagicbe", "../../backend", "api.py")
    .WaitFor(postgresdb)
    .WithReference(postgresdb)
    .WithVirtualEnvironment(".venv", true)
    .WithPip(true)
    .WithEnvironment("DbConn", postgresdb)
    .WithHttpEndpoint(env: "PORT", port: 8000)
    .WithExternalHttpEndpoints();

var jsApp = builder
    .AddJavaScriptApp("itsmagicfe", "../../frontend/itsmagicfe", "start")
    .WaitFor(pyApp)
    .WithReference(pyApp)
    .WithNpm(true)
    .WithHttpEndpoint(env: "PORT", port: 4200)
    .WithExternalHttpEndpoints();

await builder.Build().RunAsync();
