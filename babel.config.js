module.exports = function (api) {
  // Jest checks behaviour, not styling; the NativeWind transform also rewrites
  // createElement calls inside jest.mock factories, which Jest rejects.
  const isTest = api.env('test');
  return {
    presets: isTest
      ? ['babel-preset-expo']
      : [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
