import axios from 'axios';
import React from 'react';
import applyPartialUpdate from 'react-addons-update';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';

function loadFileAsDataUrl(file) {
  return  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(reader.result);
    reader.onerror = (e) => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const GenericFormItem = ({ label, help, children }) => {
  const labelElement = label ? <label>{label}</label> : null;
  const helpElement = help ? <p className="help-block">{help}</p> : null;
  return (
    <div className="form-group">
      {labelElement}
      {children}
      {helpElement}
    </div>
  );
};

const TextFormItem = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <GenericFormItem {...props}>
      <input className="form-control" type="text" value={value} onChange={handleChange} />
    </GenericFormItem>
  );
};

const PasswordFormItem = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <GenericFormItem {...props}>
      <input className="form-control" style={{width: '25%'}} type="password" value={value} onChange={handleChange} />
    </GenericFormItem>
  );
};

const StaticFormItem = ({ value, ...props }) => {
  return (
    <GenericFormItem {...props}>
      <p className="form-control-static">{value}</p>
    </GenericFormItem>
  );
};

const PhotoFormItem = ({ label, url, ratio, onChange }) => {
  const handleChange = (e) => onChange(e.target.files[0]);
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control-static">
        <div className="thumbnail">
          <FixedRatioThumbnail url={url} ratio={ratio} />
        </div>
        <input type="text" readOnly={true} className="form-control" style={{display: 'none'}} />
        <button className="btn btn-default btn-raised" style={{position: 'relative'}}>
          アップロード
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
    </div>
  );
};

const IconFormItem = ({ label, url, onChange }) => {
  const handleChange = (e) => onChange(e.target.files[0]);
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control-static">
        <div className="thumbnail" style={{ display: 'inline-block', verticalAlign: 'middle', marginBottom: '0' }}>
          <div style={{ width: '80px' }}>
            <FixedRatioThumbnail url={url} ratio={1} />
          </div>
        </div>
        <input type="text" readOnly={true} className="form-control" style={{display: 'none'}} />
        <button className="btn btn-default btn-raised" style={{ position: 'relative', verticalAlign: 'middle', marginLeft: '12px' }}>
          アップロード
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
    </div>
  );
};

const TeamEditPanel = ({ team: { name, university, photo }, onFormChange, onPhotoChange }) => {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <form>
          <StaticFormItem label="チーム名 (編集できません)" value={name} />
          <StaticFormItem label="大学名 (編集できません)" value={university} />
          <PhotoFormItem label="チーム写真" url={photo} ratio={1 / 3} onChange={onPhotoChange} />
        </form>
      </div>
    </div>
  );
};

const MemberEditPanel = ({ index, profile, onFormChange, onIconChange }) => {
  const handleIconChange = (file) => onIconChange(index, file);
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <h3>メンバー{index + 1}</h3>
        <form>
          <TextFormItem
            label="名前"
            value={profile.name}
            help="本名でもニックネームでも構いません。"
            onChange={(value) => onFormChange({name: {$set: value}})}
          />
          <IconFormItem
            label="アイコン"
            url={profile.icon}
            onChange={handleIconChange}
          />
          <GridFlow cols={3}>
            <TextFormItem
              label="TopCoder ID"
              value={profile.topcoderId}
              onChange={(value) => onFormChange({topcoderId: {$set: value}})}
            />
            <TextFormItem
              label="CodeForces ID"
              value={profile.codeforcesId}
              onChange={(value) => onFormChange({codeforcesId: {$set: value}})}
            />
            <TextFormItem
              label="Twitter ID"
              value={profile.twitterId}
              onChange={(value) => onFormChange({twitterId: {$set: value}})}
            />
            <TextFormItem
              label="Github ID"
              value={profile.githubId}
              onChange={(value) => onFormChange({githubId: {$set: value}})}
            />
          </GridFlow>
          <TextFormItem
            label="ひとこと"
            value={profile.comment}
            help="140文字以内で好きなメッセージを入力してください。"
            onChange={(value) => onFormChange({comment: {$set: value.substr(0, 140)}})}
          />
        </form>
      </div>
    </div>
  );
};

const SubmitPanel = ({ password, onChange, onClick }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <form>
        <StaticFormItem value="このフォームで送信されたプロフィール情報はすべて一般に公開されます。公開に同意してプロフィール情報を更新する場合は、プロフィール編集パスワードを以下に入力し「更新」を押して下さい。" />
        <PasswordFormItem label="プロフィール編集パスワード" value={password} onChange={onChange} />
        <div className="form-group">
          <button className="btn btn-primary btn-raised" onClick={onClick}>更新</button>
        </div>
      </form>
    </div>
  </div>
);

class TeamEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team: props.team,
      teamPhotoFile: null,
      iconFiles: [null, null, null],
      password: '',
    };
  }

  handlePasswordChange(password) {
    this.setState({ password });
  }

  handleFormChange(update) {
    this.setState(applyPartialUpdate(this.state, update));
  }

  handlePhotoChange(file) {
    if (!file) {
      return;
    }
    if (file.size >= 4 * 1024 * 1024) {
      $.snackbar({
        content: 'アップロードできるチーム写真ファイルの最大サイズは 4MB です。',
        timeout: 5000,
      });
      return;
    }
    loadFileAsDataUrl(file).then((url) => {
      this.setState(applyPartialUpdate(this.state, {
        teamPhotoFile: {$set: file},
        team: {
          photo: {$set: url},
        },
      }));
    });
  }

  handleIconChange(memberIndex, file) {
    if (!file) {
      return;
    }
    if (file.size >= 256 * 1024) {
      $.snackbar({
        content: 'アップロードできるアイコンファイルの最大サイズは 256KB です。',
        timeout: 5000,
      });
      return;
    }
    loadFileAsDataUrl(file).then((url) => {
      this.setState(applyPartialUpdate(this.state, {
        iconFiles: {
          [memberIndex]: {$set: file},
        },
        team: {
          members: {
            [memberIndex]: {
              icon: {$set: url},
            },
          },
        },
      }));
    });
  }

  handleSubmitClick(e) {
    e.preventDefault();
    const form = new FormData();
    form.set('id', this.state.team.id);
    this.state.team.members.forEach((profile, i) => {
      form.set(`members.${i}.name`, profile.name);
      form.set(`members.${i}.topcoderId`, profile.topcoderId);
      form.set(`members.${i}.codeforcesId`, profile.codeforcesId);
      form.set(`members.${i}.twitterId`, profile.twitterId);
      form.set(`members.${i}.githubId`, profile.githubId);
      form.set(`members.${i}.comment`, profile.comment);
      if (this.state.iconFiles[i]) {
        form.set(`members.${i}.iconFile`, this.state.iconFiles[i]);
      }
    });
    if (this.state.teamPhotoFile) {
      form.set('teamPhotoFile', this.state.teamPhotoFile);
    }
    form.set('password', this.state.password);
    axios.post('/api/ui/update_team', form).then((response) => {
      if (response.data.ok) {
        $.snackbar({
          content: '正常に更新されました。',
          timeout: 5000,
        });
        this.context.loader.loadFeed('teams').then(() => {
          this.context.router.push(`/team/${this.state.team.id}`);
        });
      } else {
        $.snackbar({
          content: '更新に失敗しました: ' + response.data.message,
          timeout: 5000,
        });
      }
    }, (err) => {
      $.snackbar({
        content: 'サーバーエラーが発生しました。時間を置いてやり直して下さい。',
        timeout: 5000,
      });
    });
  }

  componentDidMount() {
    // Install handlers to <input type=file>.
    $.material.input();
  }

  render() {
    if (!this.state.team) {
      return <ErrorMessage header="Team Not Found" />;
    }
    const memberElements = this.state.team.members.map((profile, index) => {
      const handleFormChangeForMember = (update) => this.handleFormChange(
        {team: {members: {[index]: update}}});
      return (
        <MemberEditPanel
          index={index}
          profile={profile}
          onFormChange={handleFormChangeForMember}
          onIconChange={this.handleIconChange.bind(this)}
        />
      );
    });
    return (
      <div>
        <div className="page-header">
          <h1>チーム情報編集</h1>
        </div>
        <TeamEditPanel
          team={this.state.team}
          onFormChange={this.handleFormChange.bind(this)}
          onPhotoChange={this.handlePhotoChange.bind(this)}
        />
        {memberElements}
        <SubmitPanel
          password={this.state.password}
          onChange={this.handlePasswordChange.bind(this)}
          onClick={this.handleSubmitClick.bind(this)}
        />
      </div>
    );
  }
};
TeamEdit.contextTypes = {
  router: () => React.PropTypes.func.isRequired,
  loader: () => React.PropTypes.func.isRequired,
};

export default TeamEdit;
