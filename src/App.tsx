<<<<<<< HEAD
function App() {

  return (
    <>
      <div className="h-screen w-full bg-[#161617] grid place-items-center">
        <h1 className="text-white text-6xl">Hello World</h1>
=======
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
function App() {
  return (
    <>
      <div className="h-screen w-full">
        <div className="w-full flex items-center justify-center">
          <div className="h-24 w-[80%] flex items-center justify-between">
            <h1 className="text-4xl font-mono">OMKAR LOHAR</h1>
            <ModeToggle />
          </div>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <Button onClick={() => toast("Hello")}>Click me</Button>
        </div>
>>>>>>> 5572eeb95dbb1e51d3e277d7e7e5acf29f330ed3
      </div>
    </>
  );
}

export default App;
