import "./EmptyUserData.scss";

function EmptyUserData() {
  return (
    <div className="empty-user-data">
      No Artefacts have been added yet. <br />{" "}
      <a href="/add-artefact">
        <b>Add an artefact</b>
      </a>{" "}
      now!
    </div>
  );
}

export default EmptyUserData;
