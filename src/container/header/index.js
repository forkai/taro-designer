import React, { Component } from 'react';
import { observer } from 'mobx-react';

import './style.less';

@observer
class Header extends Component {
	render() {
		return (
			<header className="header">
				<span className="name">可视化页面编辑器</span>
			</header>
		);
	}
}

export default Header;
