// eslint.config.js
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'web-build/**',
      'babel.config.js',
      'jest.config.js',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        // React Native
        fetch: 'readonly',
        FormData: 'readonly',
        alert: 'readonly',
        // Jest
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in this project
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(React|Ionicons|View|Text|TouchableOpacity|ScrollView|FlatList|TextInput|Button|Switch|KeyboardAvoidingView|RefreshControl|Alert|Modal|Stack|Tab|NavigationContainer|MapContainer|TileLayer|Marker|Popup|Circle|MapClickHandler|MapController)$'
      }],
      'no-undef': 'error',
    },
  },
];