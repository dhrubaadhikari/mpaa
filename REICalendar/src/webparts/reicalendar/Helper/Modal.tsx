import * as React from 'react';
import PropTypes from 'prop-types';
import styles from '../components/Reicalendar.module.scss';

export default class Modal extends React.Component <any, any>{
  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    return (
      <div className={styles.modelparent}>
        <div className={styles.modelchild} >
          {this.props.children}
          <div className="footer">
            <button onClick={this.props.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}



