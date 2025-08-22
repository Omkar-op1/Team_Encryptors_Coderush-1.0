export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="font-bold">Virtual Doctor Assistant</h1>
      <div className="space-x-4">
        <a href="/">Home</a>
        <a href="/consult">Consult</a>
        <a href="/doctors">Doctors</a>
      </div>
    </nav>
  );
}
