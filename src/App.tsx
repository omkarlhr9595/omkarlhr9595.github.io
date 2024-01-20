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
      </div>
    </>
  );
}

export default App;
