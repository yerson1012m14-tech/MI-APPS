export type WorkflowProjectType = 'xcode-swift' | 'flutter' | 'react-native' | 'unsigned-make';

export interface WorkflowOptions {
  projectName: string;
  scheme: string;
  projectType: WorkflowProjectType;
  autoRelease: boolean;
  signingMode: 'unsigned' | 'ad-hoc-secrets';
  targetBranch: string;
}

export function generateGitHubWorkflowYaml(options: WorkflowOptions): string {
  const { projectName, scheme, projectType, autoRelease, signingMode, targetBranch } = options;

  if (projectType === 'flutter') {
    return `name: Compilar IPA iOS (Flutter)

on:
  push:
    branches: [ "${targetBranch || 'main'}" ]
  workflow_dispatch:

jobs:
  build-ipa:
    runs-on: macos-latest
    steps:
      - name: Clonar Repositorio
        uses: actions/checkout@v4

      - name: Configurar Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Configurar Flutter
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Instalar Dependencias Flutter
        run: flutter pub get

      - name: Compilar IPA (No firmada para Sideload)
        run: |
          flutter build ipa --no-codesign
          mkdir -p build/ipa_output
          cd build/ios/iphoneos
          mkdir Payload
          cp -r Runner.app Payload/
          zip -r ../../ipa_output/${projectName || 'App'}.ipa Payload
          cd ../../..

      - name: Subir Archivo IPA como Artefacto
        uses: actions/upload-artifact@v4
        with:
          name: ${projectName || 'App'}-IPA
          path: build/ipa_output/${projectName || 'App'}.ipa
${
  autoRelease
    ? `
      - name: Crear Release en GitHub con IPA
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        with:
          files: build/ipa_output/${projectName || 'App'}.ipa
          name: Versión \${{ github.ref_name || 'v1.0.0' }}
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
    : ''
}`;
  }

  if (projectType === 'react-native') {
    return `name: Compilar IPA iOS (React Native)

on:
  push:
    branches: [ "${targetBranch || 'main'}" ]
  workflow_dispatch:

jobs:
  build-ipa:
    runs-on: macos-latest
    steps:
      - name: Clonar Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependencias Node
        run: npm install

      - name: Instalar CocoaPods
        run: |
          cd ios
          pod install
          cd ..

      - name: Compilar App con Xcodebuild
        run: |
          cd ios
          xcodebuild -workspace ${projectName || 'App'}.xcworkspace \\
            -scheme ${scheme || projectName || 'App'} \\
            -configuration Release \\
            -sdk iphoneos \\
            -derivedDataPath build \\
            CODE_SIGNING_ALLOWED=NO \\
            CODE_SIGNING_REQUIRED=NO \\
            CODE_SIGN_IDENTITY=""
          
          mkdir Payload
          cp -r build/Build/Products/Release-iphoneos/*.app Payload/
          zip -r ../${projectName || 'App'}.ipa Payload
          cd ..

      - name: Subir Artefacto IPA
        uses: actions/upload-artifact@v4
        with:
          name: ${projectName || 'App'}-IPA
          path: ${projectName || 'App'}.ipa
`;
  }

  // Standard Xcode / Swift Project
  return `name: Compilar IPA iOS (Xcode / Swift)

on:
  push:
    branches: [ "${targetBranch || 'main'}" ]
  workflow_dispatch:

jobs:
  build-ios-ipa:
    runs-on: macos-latest
    steps:
      - name: Clonar Repositorio
        uses: actions/checkout@v4

      - name: Seleccionar Versión de Xcode
        run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

      - name: Compilar Archivo .app sin firma (Listo para Sideloadly/TrollStore)
        run: |
          xcodebuild build \\
            -project ${projectName ? `${projectName}.xcodeproj` : '*.xcodeproj'} \\
            -scheme "${scheme || 'App'}" \\
            -configuration Release \\
            -sdk iphoneos \\
            -derivedDataPath build \\
            CODE_SIGN_IDENTITY="" \\
            CODE_SIGNING_REQUIRED=NO \\
            CODE_SIGNING_ALLOWED=NO

      - name: Empaquetar en formato .IPA
        run: |
          mkdir -p output/Payload
          APP_PATH=$(find build/Build/Products/Release-iphoneos -name "*.app" -maxdepth 1 | head -n 1)
          cp -R "$APP_PATH" output/Payload/
          cd output
          zip -r "${projectName || 'App'}.ipa" Payload
          cd ..

      - name: Subir Artefacto IPA
        uses: actions/upload-artifact@v4
        with:
          name: ${projectName || 'App'}-IPA
          path: output/${projectName || 'App'}.ipa
${
  autoRelease
    ? `
      - name: Publicar Release Automática en GitHub
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        with:
          files: output/${projectName || 'App'}.ipa
          name: Release \${{ github.ref_name || 'v1.0.0' }}
          tag_name: \${{ github.ref_name || 'v1.0.0' }}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
    : ''
}`;
}
