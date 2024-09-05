import sindri from 'sindri';

async function main() {
  try {
    console.log('Compiling circuit...');
    // Compile the circuit in the `packages/circuit` directory.
    const circuit = await sindri.createCircuit('packages/circuit');

    // Log out the circuit object as JSON.
    console.log(JSON.stringify(circuit, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
