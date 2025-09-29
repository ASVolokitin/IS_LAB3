import NavBar from "../../elements/NavBar/NavBar";
import './NotFoundPage.css'
export const NotFoundPage = () => {
  return (
    <>
      <NavBar />
      <div className="page-container">
        <div className="text-container">
          <h1>Is anybody here?</h1>
          <p>For sure not the content of the website</p>
        </div>
      </div>
    </>
  );
};
