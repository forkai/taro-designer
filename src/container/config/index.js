import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observe } from 'mobx';
import { Button, Field, Form, Input, InputNumber, Select, Tips } from 'cloud-react';
import { CONFIGS } from '@components';

import Spacing from './Spacing';
import store from '../store';

import './style.less';

@observer
class Config extends Component {
	filed = new Field(this);

	componentDidMount() {
		// 切换组件的时候，form表单虽然重新渲染了，但是 filed 里面存在的值并没有清除，因此需要手动获取一下所有的 names，然后保证数据渲染的准确性
		observe(store, 'currentProps', () => {
			const names = Object.keys(this.filed.getValues());
			this.filed.remove(names);
		});
	}

	@action.bound
	handleFormChange() {
		const values = this.filed.getValues();
		// 需要对得到的值进行处理，去除掉当前的 id，更新到 props 里面
		const newValues = Object.keys(values).reduce((data, key) => {
			const newKey = key.split('-')[0];

			if (newKey.includes('_')) {
				const styleKey = newKey.split('_')[1];
				if (!data.styles) {
					data.styles = {
						[styleKey]: values[key]
					};
				} else {
					data.styles[styleKey] = values[key];
				}
			} else {
				data[newKey] = values[key];
			}
			return data;
		}, {});

		store.updatePageData(newValues);
	}

	renderByType(item, isStyle) {
		const { init } = this.filed;
		// 为了保证每一个 Form.Item 的 name 唯一性，我们使用 `key-id` 的形式作为 name，如果为样式的话，增加一个 styles_ 前缀，使得好分割，保证数据更新准确
		const name = isStyle ? `styles_${item.key}-${store.currentId}` : `${item.key}-${store.currentId}`;
		const value = isStyle ? (store.currentProps.styles && store.currentProps.styles[item.key]) || '' : store.currentProps[item.key];
		const defaultValue = CONFIGS[store.currentType].props[item.key];

		const options = {
			initValue: value || defaultValue,
			onChange: this.handleFormChange
		};

		switch (item.type) {
			case 'Input':
				return <Input {...init(name, options)} />;
			case 'InputNumber':
				return <InputNumber {...init(name, options)} />;
			case 'Textarea':
				return <Input.Textarea rows={4} {...init(name, options)} />;
			case 'Select':
				return <Select dataSource={item.dataSource} {...init(name, options)} />;
			case 'Spacing':
				return <Spacing {...init(name, options)} value={value} />;
			default:
				return null;
		}
	}

	renderItem(index, item, isStyle) {
		return (
			<Form.Item key={index} label={item.label}>
				{this.renderByType(item, isStyle)}
			</Form.Item>
		);
	}

	renderContent() {
		return store.currentConfig.config.map((item, index) =>
			item.key === 'styles' ? this.renderStyle(index, item.childs) : this.renderItem(index, item, false)
		);
	}

	renderStyle(parentIndex, styles) {
		return styles.map((item, index) => this.renderItem(`${parentIndex}-${index}`, item, true));
	}

	render() {
		return (
			<section className="config">
				<header>
					属性配置区
					{store.currentConfig ? `（${store.currentConfig.name}）` : ''}
				</header>
				<div>
					{store.currentConfig ? (
						<>
							<Button size="small">删除此元素</Button>
							<Form field={this.field}>{this.renderContent()}</Form>
						</>
					) : (
						<Tips msg="请选择要编辑的元素" type="major" />
					)}
				</div>
			</section>
		);
	}
}

export default Config;
