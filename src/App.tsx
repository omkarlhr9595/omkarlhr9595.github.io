import peep25 from "./assets/peep-25.svg";

function App() {
  return (
    <>
      <div className="h-screen w-full grid place-items-center">
        <div className="container h-full w-full flex flex-col items-center justify-center">
          <img src={peep25} alt="" className="w-40 sm:w-64" />
          <h1 className="text-bgwhite text-4xl sm:text-7xl font-body">
            Work In Progress
          </h1>
        </div>
      </div>
    </>
  );
}

export default App;
