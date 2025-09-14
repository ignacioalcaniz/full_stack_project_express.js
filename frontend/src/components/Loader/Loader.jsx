import Spinner from 'react-bootstrap/Spinner';
import "./Loader.css"


export const Loader=({text})=> {
  return (
    <div className='div-loader'>
    <Spinner animation="border" role="status">
      <span>{text}</span>
    </Spinner>
    </div>
   
  );
}