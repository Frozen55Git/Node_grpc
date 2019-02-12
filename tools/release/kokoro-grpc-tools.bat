cd /d %~dp0
cd ../..

git submodule update --init --recursive

set ARTIFACTS_OUT=%cd%/artifacts
powershell -File ./packages/grpc-tools/build_binaries.ps1 || goto :error
goto :EOF

:error
exit /b 1