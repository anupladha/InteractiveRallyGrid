Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
	myStore: undefined,
	myGrid: undefined,
	
    launch: function() {
    	console.log ('Our Second App!');
		this.pulldownContainer = Ext.create('Ext.container.Container', {
			id: 'pulldown-container-id',
			layout: {
				type: 'hbox',
				align: 'stretch'
			}
		});
		this.add(this.pulldownContainer);
		this._loadIterations();
    },
	
	_loadIterations: function() {
		this.iterComboBox = Ext.create ('Rally.ui.combobox.IterationComboBox', {
			fieldLabel: 'Iteration',
			labelAlign: 'right',
			width: 300,
			listeners: {
				ready: function(combobox){
					this._loadSeverities();
				},
				select: function(combobox, records) {
					this._loadData();
				},
				scope: this
			}
		});
		this.pulldownContainer.add(this.iterComboBox);
	},
	_loadSeverities: function() {
		this.severityComboBox = Ext.create ('Rally.ui.combobox.FieldValueComboBox', {
			model: 'Defect',
			field: 'Severity',
			fieldLabel: 'Severity',
			labelAlign: 'right',
			listeners: {
				ready: function(combobox){
					this._loadData();
				},
				select: function(combobox, records) {
					this._loadData();
				},
				scope: this
			}
		});
		this.pulldownContainer.add(this.severityComboBox);
	},

    //Get Data from Rally
	_loadData: function() {
		var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
		var selectedSeverityValue = this.severityComboBox.getRecord().get('value');
		console.log('selected severity', selectedSeverityValue);
		console.log('selected iter', selectedIterRef);
		var myFilters = [
			{
				property: 'Iteration',
				operation: '=',
				value: selectedIterRef
			},
			{
				property: 'Severity',
				operation: '=',
				value: selectedSeverityValue
			}
		];
		//if store exists, just load the new data
		if (this.defectStore) {
			console.log('store exists');
			this.defectStore.setFilter(myFilters);
			this.defectStore.load();
		}
		//create store
		else {
			console.log('creating store');
			this.defectStore = Ext.create ('Rally.data.wsapi.Store', {
				model: 'Defect',
				autoLoad: true,
				filters: myFilters,			
				listeners: {
					load: function (myStore, myData, success) {
						console.log ('got data', myStore, myData, success);
						if (!this.myGrid)
							this._createGrid(myStore);
					},
					scope: this
				},
				fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
			});
		}
	},
    
    // Create & show a Grid of given stories
    _createGrid: function(myDefectStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
        	store: myDefectStore,
        	columnCfgs: [
        	   'FormattedID', 'Name', 'Severity', 'Iteration'          
        	]                    	
        });
        console.log ('my grid', this.myGrid);
        this.add(this.myGrid);
    }   
});
