module.exports = {
    preset: 'react-native',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest', // Use babel-jest for JS/TS files
    },
    transformIgnorePatterns: [
      'node_modules/(?!(@react-native|react-native|@react-native-community|@react-navigation)/)', // Ensure RN modules are transformed
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ['./jest.setup.js'],

  };
  