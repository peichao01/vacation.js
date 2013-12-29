/**
 * Created with JetBrains WebStorm.
 * User: peichao
 * Date: 13-12-28
 * Time: 下午10:40
 * To change this template use File | Settings | File Templates.
 */
define('index',['module_a','module_d'],function(require){
	//require('module_a');
	require('module_b');
	require('module_c');
	require('module_d');
});