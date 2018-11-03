import React from 'react';

import TeamInfo from './TeamInfo';

const TeamInfoPage = ({ match }) => <TeamInfo requestedTeamId={match.params.requestedTeamId} />;

export default TeamInfoPage;
