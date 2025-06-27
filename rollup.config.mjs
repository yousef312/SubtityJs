import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/subtity.js',
    output: [
      {
        file: 'dist/subtity.umd.js',
        format: 'umd',
        name: 'Subtity',
        sourcemap: true,
      },
      {
        file: 'dist/subtity.umd.min.js',
        format: 'umd',
        name: 'Subtity',
        plugins: [terser()],
        sourcemap: true,
      },
      {
        file: 'dist/subtity.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/subtity.cjs.js',
        format: 'cjs',
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];