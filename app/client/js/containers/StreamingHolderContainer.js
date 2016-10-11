import React from 'react';
import { connect } from 'react-redux';

import StreamingHolder from '../components/StreamingHolder';

const mapStateToProps = ({ streaming }) => streaming;

const StreamingHolderContainer = connect(mapStateToProps)(StreamingHolder);

export default StreamingHolderContainer;
