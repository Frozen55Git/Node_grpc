@rem Copyright 2017 gRPC authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem     http://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.

SET ROOT=%~dp0
cd /d %~dp0

PowerShell -Command .\install-nvm-windows.ps1

SET NVM_HOME=%ROOT%nvm
SET NVM_SYMLINK=%ROOT%nvm\nodejs
SET PATH=%NVM_HOME%;%NVM_SYMLINK%;%PATH%

nvm version

nvm install 8.5.0
nvm use 8.5.0
node -e console.log(process.versions)

call npm install --build-from-source

@rem delete the redundant openssl headers
for /f "delims=v" %%v in ('node --version') do (
  rmdir "%USERPROFILE%\.node-gyp\%%v\include\node\openssl" /S /Q
)

@rem rebuild, because it probably failed the first time
call npm install --build-from-source %*
