import React, { Component } from 'react';
import SortableTree, {defaultGetNodeKey} from 'react-sortable-tree';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app
import { constructTree } from './toolbelt';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import MaterialIcon, {colorPallet} from 'material-icons-react';


const MIN_NUMBER_OF_PARENTS = 20;
const MAX_NUMBER_OF_CHILDREN = 15;
const MAX_DEEPNESS = 4;
const Nodes = constructTree(MAX_DEEPNESS, MAX_NUMBER_OF_CHILDREN ,MIN_NUMBER_OF_PARENTS);
const getTotalNumberOfElements = (nodes, counter = 0) => {
  return counter + nodes.length + nodes.reduce((acc, n) => getTotalNumberOfElements(n.children, acc) ,0)
}

const totalNumberOfNodes = getTotalNumberOfElements(Nodes);


export default class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNodes: [],
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: Nodes,
    };
  }



  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    const { searchString, searchFocusIndex, searchFoundCount } = this.state;

    // Case insensitive search of `node.title`
    const customSearchMethod = ({ node, searchQuery }) =>
      searchQuery &&
      node.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });

    const handleAddSelected = (node) => {
      console.log("Adding ", node)
      let updatedSelectedNodes = this.state.selectedNodes.slice();
      if (updatedSelectedNodes.indexOf(node) == -1) {
        updatedSelectedNodes.push(node);
      }
      this.setState({
        selectedNodes: updatedSelectedNodes
      })
    }  

    const handleDeleteSelected = (node) => {
      let updatedSelectedNodes = this.state.selectedNodes.slice();
      let deleteAtIndex = updatedSelectedNodes.indexOf(node);
      updatedSelectedNodes.splice(deleteAtIndex,1);
      console.log("Deleting ", node, " at index", deleteAtIndex)
      this.setState({
        selectedNodes: updatedSelectedNodes
      })

    }

    const selectedNodesDisplay = this.state.selectedNodes.map(node => {
      return (
        <span 
          key={node.id} 
          onClick={() => handleDeleteSelected(node)}>
          <small><strong>  -  {node.title}   - </strong></small>
        </span>
        )
    })
    return (
      <div>
        <hr></hr>
        {(this.state.selectedNodes.length > 0) ? <div>{selectedNodesDisplay}</div> : <p>No Nodes Selected</p>}
        <hr></hr>
        <div>Number of Nodes: {totalNumberOfNodes}<span className="mi mi-face"></span></div>
        <form
            style={{ display: 'inline-block' }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <input
              id="find-box"
              type="text"
              placeholder="Search..."
              style={{ fontSize: '1rem' }}
              value={searchString}
              onChange={event =>
                this.setState({ searchString: event.target.value })
              }
            />

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
              {searchFoundCount || 0}
            </span>
          </form>
          <div style={{ height: 600 }}>
            <SortableTree
              canDrag={false}
              theme={FileExplorerTheme}
              treeData={this.state.treeData}
              onChange={treeData => this.setState({ treeData })}
              searchMethod={customSearchMethod}
              searchQuery={searchString}
              searchFocusOffset={searchFocusIndex}
              searchFinishCallback={matches =>
                this.setState({
                  searchFoundCount: matches.length,
                  searchFocusIndex:
                    matches.length > 0 ? searchFocusIndex % matches.length : 0,
                })
              }
              generateNodeProps={({ node }) => ({
                title: (
                  <span style={{fontFamily: 'monospace'}} onClick={() => handleAddSelected(node)}>{node.title}
                  </span>
                )
            })}


            />
          </div>
      </div>
    );
  }
}


