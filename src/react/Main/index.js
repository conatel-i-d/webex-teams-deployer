import React from 'react';
import { useDispatch } from 'react-redux';

import { ping } from '../state/courses.js';

function Main() {
  var dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(ping());
  }, [dispatch]);

  return (
    <div className="Main"></div>
  );
}

export default Main;