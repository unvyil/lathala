import React from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { StudioProvider, useStudio } from "./contexts/StudioContext";
import { Dashboard } from "./pages/Dashboard";
import { CRM } from "./pages/CRM";
import { Editor } from "./pages/Editor";

function StudioRouter() {
  const { view } = useStudio();
  if (view === "editor") return <Editor />;
  if (view === "crm") return <CRM />;
  return <Dashboard />;
}

export function App() {
  return (
    <StudioProvider>
      <div className="h-full min-h-full w-full bg-base font-sans text-onyx">
        <SignedIn>
          <StudioRouter />
        </SignedIn>
        <SignedOut>
          <div className="flex h-full min-h-screen w-full flex-col items-center justify-center bg-base px-6 text-center">
            <h1 className="font-serif text-5xl text-onyx">Lathala Studio</h1>
            <p className="mt-3 text-sm text-espresso/70">
              Sign in to manage your designs and audience directory.
            </p>
            <div className="mt-6">
              <SignInButton mode="modal">
                <button className="h-11 rounded-xl bg-onyx px-6 text-sm font-medium text-parchment transition-colors duration-150 ease-studio hover:bg-espresso">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
      </div>
    </StudioProvider>
  );
}
export default App;
