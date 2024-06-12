import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Room } from "./modules/Room/index.ts";
import { GlobalContextProvider } from "./GlobalContext.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/room/:id",
    element: <Room />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GlobalContextProvider>
    <RouterProvider router={router} />
  </GlobalContextProvider>
);
