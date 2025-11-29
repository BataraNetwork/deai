# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [ pkgs.python3 pkgs.nodejs pkgs.pnpm ];
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [ "ms-python.python", "esbenp.prettier-vscode" ];
    # Set environment variables
    containerEnv = {
      PYTHONPATH = ".";
    };
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install =
          "pnpm install && python -m venv .venv && source .venv/bin/activate && pip install -r services/node-engine/requirements.txt";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "services/node-engine/app.py" "services/node-engine/tasks.py" ];
      }; # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          # Command to start the FastAPI server
          command = [
            "source"
            ".venv/bin/activate"
            "&&"
            "uvicorn"
            "services.node-engine.app:app"
            "--host"
            "0.0.0.0"
            "--port"
            "$PORT"
            "--reload"
          ];
          manager = "web";
        };
        celery-worker = {
          # Command to start the Celery worker
          name = "Celery Worker";
          command = [
            "source"
            ".venv/bin/activate"
            "&&"
            "celery"
            "-A"
            "services.node-engine.celery_app"
            "worker"
            "-l"
            "info"
          ];
          manager = "terminal";
        };
      };
    };
  };
}
