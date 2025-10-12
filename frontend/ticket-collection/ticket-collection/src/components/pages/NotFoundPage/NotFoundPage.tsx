import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../elements/NavBar/NavBar";
import "./NotFoundPage.css";
export const NotFoundPage = () => {

  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div className="page-container">
        <div className="text-container">
          <h1>Is anybody here? ...</h1>
          <p>For sure not the content of the website</p>
          <Link to={"/"}>
            <div
              className="button-centered-container"
              style={{ marginTop: 7 }}
            >
              <button className="outline-button" onClick={() => navigate(-1)}>Go back</button>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};
