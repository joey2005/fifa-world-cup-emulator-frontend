import Select from 'react-select';
import './Formation.scss';

function Formation(props) {
  const options = [
    { value: '4-3-3', label: '4-3-3' },
    { value: '4-4-2', label: '4-4-2' },
    { value: '3-6-1', label: '3-6-1' }
  ];
  return (
    <form
      onSubmit={props.submitFormationChange}
      className="formation-form"
    >
      <Select
        placeholder={props.formation}
        value={props.formation}
        onChange={props.handleFormationChange}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      <button type="submit" className="button">
        <p>Save Formation</p>
      </button>
    </form>
  );
}

export default Formation;
