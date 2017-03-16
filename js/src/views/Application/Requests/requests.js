// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { LinearProgress } from 'material-ui';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { MethodDecoding, IdentityIcon, ScrollableText } from '~/ui';

import styles from './requests.css';

const ERROR_STATE = 'ERROR_STATE';
const DONE_STATE = 'DONE_STATE';
const WAITING_STATE = 'WAITING_STATE';

class Requests extends Component {
  static propTypes = {
    blockNumber: PropTypes.object.isRequired,
    requests: PropTypes.object.isRequired
  };

  render () {
    const { requests } = this.props;

    return (
      <div className={ styles.requests }>
        { Object.values(requests).map((request) => this.renderRequest(request)) }
      </div>
    );
  }

  renderRequest (request) {
    const { transaction } = request;
    const state = this.getTransactionState(request);

    const statusClasses = [ styles.status ];

    if (state.type === ERROR_STATE) {
      statusClasses.push(styles.error);
    }

    return (
      <div
        className={ styles.request }
        key={ request.id }
      >
        <div className={ statusClasses.join(' ') }>
          { this.renderStatus(request) }
        </div>
        {
          state.type === ERROR_STATE
          ? null
          : (
            <LinearProgress
              max={ 6 }
              mode={ state.type === WAITING_STATE ? 'indeterminate' : 'determinate' }
              value={ state.type === DONE_STATE ? state.blockHeight.toNumber() : 6 }
            />
          )
        }
        <div className={ styles.container }>
          <div className={ styles.identity } title={ transaction.from }>
            <IdentityIcon
              address={ transaction.from }
              inline
              center
              className={ styles.icon }
            />
          </div>
          <MethodDecoding
            address={ transaction.from }
            transaction={ transaction }
          />
        </div>
      </div>
    );
  }

  renderStatus (request) {
    const { error, transactionHash, transactionReceipt } = request;

    if (error) {
      return (
        <div
          className={ styles.inline }
          title={ error.message }
        >
          <span>An error occured: </span>
          <ScrollableText
            small
            text={ error.text || error.message }
          />
        </div>
      );
    }

    if (transactionReceipt) {
      return (
        <p>Transaction mined at block #{ transactionReceipt.blockNumber.toFormat() }</p>
      );
    }

    if (transactionHash) {
      return (
        <div className={ styles.inline }>
          <span>Transaction sent to network with hash </span>
          <ScrollableText
            small
            text={ transactionHash }
          />
        </div>
      );
    }

    return (
      <p>Transaction pending in Signer</p>
    );
  }

  getTransactionState (request) {
    const { error, transactionReceipt } = request;

    if (error) {
      return { type: ERROR_STATE };
    }

    if (transactionReceipt) {
      const blockHeight = this.props.blockNumber.minus(transactionReceipt.blockNumber);

      return { type: DONE_STATE, blockHeight };
    }

    return { type: WAITING_STATE };
  }
}

const mapStateToProps = (state) => {
  return { blockNumber: state.nodeStatus.blockNumber, requests: state.requests };
};

export default connect(mapStateToProps, null)(Requests);
