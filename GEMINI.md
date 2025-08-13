# Project Overview

This project is a plugin for the "Pot" translation application. It enables Pot to use a custom machine translation server (hence "mtranserver") for translations. The plugin communicates with a backend server that exposes a translation API.

## Key Technologies

-   **Frontend:** JavaScript (ES6+)
-   **Host Application:** Pot (a desktop translation software)
-   **API Communication:** `window.fetch`

## Architecture

The plugin consists of a single JavaScript file (`main.js`) that implements the translation logic. It reads the translation server's URL from the Pot application's configuration.

The plugin makes POST requests to a `/translate` endpoint and GET requests to a `/health` endpoint on the configured server.

### Core Functions

1. **translate()** - Main translation function
2. **checkHealth()** - Server health check function
3. **processUrl()** - URL processing and normalization
4. **handleError()** - Unified error handling
5. **validateConfig()** - Configuration validation
6. **fetchWithTimeout()** - Fetch with timeout support

# Building and Running

This project is a plugin and is not meant to be run standalone. It needs to be loaded into the Pot application.

## Building the Plugin

The project uses a GitHub Actions workflow to build the plugin. The workflow zips the necessary files (`info.json`, `mtranserver.svg`, `main.js`) into a `.potext` file, which is the plugin format for Pot.

To build the plugin manually, you can zip the following files:

-   `info.json`
-   `mtranserver.svg`
-   `main.js`

And rename the resulting zip file to `mtranserver.potext`.

### GitHub Actions Workflow

The workflow performs these steps:
1. Checks out the code
2. Installs required tools (jq for JSON processing)
3. Extracts plugin metadata from `info.json`
4. Zips the required files into a `.potext` package
5. Uploads as an artifact
6. Creates a release when tagging

# Development Conventions

## Code Style

The code in `main.js` follows modern JavaScript conventions:
- Uses async/await for asynchronous operations
- Implements comprehensive error handling
- Follows JSDoc for function documentation
- Modular design with single responsibility functions

## Error Handling

The plugin implements a unified error handling approach:
- All errors are prefixed with `[MTranServer]` for easy identification
- Detailed error information is provided when available
- HTTP status codes are preserved for debugging
- Network timeouts are handled gracefully

## Testing

There are no automated tests in this project. Testing is likely done manually by loading the plugin into the Pot application and verifying its functionality.

### Manual Testing Checklist

1. Plugin installation in Pot
2. Configuration with valid/invalid URLs
3. Translation functionality with various languages
4. Health check functionality
5. Error handling for network issues
6. Timeout behavior
7. Empty/whitespace text handling

## Security Considerations

- API tokens are handled securely (not logged)
- Input validation prevents injection attacks
- CORS policies are respected by the host application
- No client-side storage of sensitive information
