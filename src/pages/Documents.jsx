import React, { useState, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  MoreVert as MoreVertIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  ContentPaste as ContentPasteIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 600px;
  margin: 0 24px;

  .MuiTextField-root {
    width: 100%;
    background-color: #f8f9fa;
    border-radius: 6px;
    
    .MuiOutlinedInput-root {
      padding-left: 40px;
      
      &:hover .MuiOutlinedInput-notchedOutline {
        border-color: #0061d5;
      }
      
      &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: #0061d5;
      }
    }
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #637282;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const NewButton = styled(Button)`
  background-color: #0061d5;
  color: white;
  text-transform: none;
  padding: 6px 16px;
  font-weight: 500;
  
  &:hover {
    background-color: #004db3;
  }
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  text-align: center;
  
  svg {
    font-size: 64px;
    color: #0061d5;
    margin-bottom: 24px;
  }
`;

const ContentArea = styled('div')`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 200px;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;
`;

function Documents() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [copiedItem, setCopiedItem] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('Uploading files:', acceptedFiles);
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      file: file,
      parentId: currentFolder?.id || null,
      lastModified: new Date(file.lastModified).toLocaleDateString()
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setShowNewDialog(false); // Close the Create New dialog
  }, [currentFolder]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    const file = files.find(f => f.id === draggableId);
    if (!file) return;

    // If dropping into a folder
    if (destination.droppableId !== 'root') {
      setFiles(prev => prev.map(f => 
        f.id === draggableId 
          ? { ...f, parentId: destination.droppableId }
          : f
      ));
    } else {
      // If dropping back to root
      setFiles(prev => prev.map(f => 
        f.id === draggableId 
          ? { ...f, parentId: null }
          : f
      ));
    }
  };

  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
  };

  const getCurrentFiles = () => {
    return files.filter(file => file.parentId === currentFolder);
  };

  const getCurrentFolders = () => {
    return folders.filter(folder => !folder.parentId);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true // Disable click because we'll handle it manually
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFolderName.trim(),
        type: 'folder',
        parentId: currentFolder?.id || null,
        createdAt: new Date().toLocaleDateString()
      };
      
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    onDrop(files);
    event.target.value = null; // Reset the input
  };

  const handleMenuOpen = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setContextMenu(null);
  };

  const handleEdit = (event, item) => {
    event.stopPropagation();
    console.log('Editing item:', item);
    setSelectedItem(item);
    setEditName(item.name);
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleEditSave = () => {
    console.log('Starting save with:', { editName, selectedItem });
    
    if (!editName.trim() || !selectedItem) {
      console.log('Missing required data:', { editName, selectedItem });
      return;
    }

    const newName = editName.trim();
    
    try {
      if (selectedItem.type === 'folder') {
        console.log('Updating folder name from', selectedItem.name, 'to', newName);
        setFolders(prevFolders => {
          const updatedFolders = prevFolders.map(folder => 
            folder.id === selectedItem.id 
              ? { ...folder, name: newName }
              : folder
          );
          console.log('Updated folders:', updatedFolders);
          return updatedFolders;
        });
      } else {
        console.log('Updating file name from', selectedItem.name, 'to', newName);
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => 
            file.id === selectedItem.id 
              ? { ...file, name: newName }
              : file
          );
          console.log('Updated files:', updatedFiles);
          return updatedFiles;
        });
      }
      
      // Only clear states after successful update
      setShowEditDialog(false);
      setEditName('');
      setSelectedItem(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      if (selectedItem.type === 'folder') {
        setFolders(prev => prev.filter(f => f.id !== selectedItem.id));
        // Also delete all files in this folder
        setFiles(prev => prev.filter(f => f.parentId !== selectedItem.id));
      } else {
        setFiles(prev => prev.filter(f => f.id !== selectedItem.id));
      }
      handleMenuClose();
    }
  };

  const handleCopy = () => {
    if (selectedItem) {
      console.log('Copying item:', selectedItem);
      setCopiedItem(selectedItem);
      handleMenuClose();
    }
  };

  const handlePaste = () => {
    if (!copiedItem) return;

    console.log('Pasting item:', copiedItem);
    const timestamp = new Date().getTime();
    
    if (copiedItem.type === 'folder') {
      // Copy folder and its contents
      const newFolder = {
        ...copiedItem,
        id: Math.random().toString(36).substr(2, 9),
        name: `${copiedItem.name} (Copy)`,
        parentId: currentFolder?.id || null,
        createdAt: new Date().toLocaleDateString()
      };
      
      setFolders(prev => [...prev, newFolder]);
      
      // Copy files in the folder
      const filesInFolder = files.filter(f => f.parentId === copiedItem.id);
      const newFiles = filesInFolder.map(file => ({
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        parentId: newFolder.id,
        name: file.name
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // Copy single file
      const newFile = {
        ...copiedItem,
        id: Math.random().toString(36).substr(2, 9),
        name: `${copiedItem.name} (Copy)`,
        parentId: currentFolder?.id || null,
        lastModified: new Date().toLocaleDateString()
      };
      
      setFiles(prev => [...prev, newFile]);
    }
    
    setShowAreaMenu(false);
    setContextMenuPosition(null);
  };

  const handleAreaContextMenu = (event) => {
    event.preventDefault();
    setShowAreaMenu(true);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <Container>
      <Header>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>All Files</Typography>
        
        <SearchContainer>
          <StyledSearchIcon />
          <TextField
            placeholder="Search files and folders"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <ActionButtons>
          <NewButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewDialog(true)}
          >
            New
          </NewButton>
          
          <ViewControls>
            <IconButton onClick={() => setView('grid')}>
              <GridViewIcon color={view === 'grid' ? 'primary' : 'inherit'} />
            </IconButton>
            <IconButton onClick={() => setView('list')}>
              <ListViewIcon color={view === 'list' ? 'primary' : 'inherit'} />
            </IconButton>
            <IconButton>
              <SortIcon />
            </IconButton>
          </ViewControls>
        </ActionButtons>
      </Header>

      <ContentArea onContextMenu={handleAreaContextMenu}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {currentFolder ? (
            <div>
              <Button 
                onClick={handleBackClick}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
              >
                Back
              </Button>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {folders.find(f => f.id === currentFolder)?.name || 'Folder'}
              </Typography>
              <Droppable droppableId={currentFolder}>
                {(provided) => (
                  <FileGrid ref={provided.innerRef} {...provided.droppableProps}>
                    {getCurrentFiles().map((file, index) => (
                      <Draggable key={file.id} draggableId={file.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FileItem 
                              file={file} 
                              view={view}
                              isDragging={snapshot.isDragging}
                              onMenuClick={(e) => handleMenuOpen(e, file)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </FileGrid>
                )}
              </Droppable>
            </div>
          ) : (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {files.length === 0 && folders.length === 0 ? (
                <EmptyState>
                  <UploadIcon />
                  <Typography variant="h6">Get started by adding your first file</Typography>
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    Create new documents directly or upload an existing file
                  </Typography>
                  <NewButton
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => setShowNewDialog(true)}
                  >
                    Upload
                  </NewButton>
                </EmptyState>
              ) : (
                <div>
                  <Droppable droppableId="root">
                    {(provided) => (
                      <FileGrid ref={provided.innerRef} {...provided.droppableProps}>
                        {getCurrentFolders().map((folder) => (
                          <div key={folder.id} onClick={() => handleFolderClick(folder.id)}>
                            <Droppable droppableId={folder.id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{
                                    background: snapshot.isDraggingOver ? '#f0f9ff' : 'transparent',
                                    borderRadius: '8px',
                                    transition: 'background 0.2s'
                                  }}
                                >
                                  <FileItem 
                                    file={folder} 
                                    view={view}
                                    isDropTarget={snapshot.isDraggingOver}
                                    onMenuClick={(e) => handleMenuOpen(e, folder)}
                                  />
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        ))}
                        {files.filter(f => !f.parentId).map((file, index) => (
                          <Draggable key={file.id} draggableId={file.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <FileItem 
                                  file={file} 
                                  view={view}
                                  isDragging={snapshot.isDragging}
                                  onMenuClick={(e) => handleMenuOpen(e, file)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </FileGrid>
                    )}
                  </Droppable>
                </div>
              )}
            </div>
          )}
        </DragDropContext>
      </ContentArea>

      {/* Create New Dialog */}
      <Dialog 
        open={showNewDialog} 
        onClose={() => setShowNewDialog(false)}
      >
        <DialogTitle>Create New</DialogTitle>
        <List sx={{ pt: 0 }}>
          <ListItem disableGutters>
            <ListItemButton onClick={() => {
              setShowNewDialog(false);
              setShowNewFolderDialog(true);
            }}>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="New Folder" />
            </ListItemButton>
          </ListItem>
          <ListItem disableGutters>
            <ListItemButton
              component="label"
            >
              <ListItemIcon>
                <UploadIcon />
              </ListItemIcon>
              <ListItemText primary="Upload Files" />
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileInput}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog 
        open={showNewFolderDialog} 
        onClose={() => setShowNewFolderDialog(false)}
      >
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenu}
        open={Boolean(contextMenu)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
      >
        <MenuItem onClick={(e) => handleEdit(e, selectedItem)}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Area Context Menu */}
      <Menu
        open={showAreaMenu}
        onClose={() => {
          setShowAreaMenu(false);
          setContextMenuPosition(null);
        }}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuPosition
            ? { top: contextMenuPosition.y, left: contextMenuPosition.x }
            : undefined
        }
      >
        <MenuItem
          onClick={handlePaste}
          disabled={!copiedItem}
        >
          <ContentPasteIcon sx={{ mr: 1, fontSize: 20 }} />
          Paste
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => {
          setShowEditDialog(false);
          setEditName('');
          // Don't clear selectedItem here
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>
          {selectedItem ? `Rename ${selectedItem.type === 'folder' ? 'Folder' : 'File'}` : 'Rename'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && editName.trim() && selectedItem) {
                handleEditSave();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowEditDialog(false);
              setEditName('');
              // Don't clear selectedItem here
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            disabled={!editName.trim() || !selectedItem}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const FileItem = styled(({ file, view, isDragging, isDropTarget, onMenuClick, ...props }) => (
  <div {...props} className="file-item">
    <div className="icon">
      {file.type === 'folder' ? (
        <FolderIcon sx={{ fontSize: 40 }} />
      ) : file.type.includes('image') ? (
        <img src={URL.createObjectURL(file.file)} alt={file.name} />
      ) : (
        <FileIcon sx={{ fontSize: 40 }} />
      )}
    </div>
    <div className="info">
      <Typography noWrap>{file.name}</Typography>
      <Typography variant="caption" color="textSecondary">
        {file.lastModified || file.createdAt}
      </Typography>
    </div>
    <IconButton 
      size="small" 
      onClick={(e) => onMenuClick(e, file)}
      sx={{ 
        opacity: 0,
        '.file-item:hover &': { opacity: 1 },
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
      }}
    >
      <MoreVertIcon />
    </IconButton>
  </div>
))`
  display: flex;
  flex-direction: ${props => props.view === 'grid' ? 'column' : 'row'};
  align-items: ${props => props.view === 'grid' ? 'stretch' : 'center'};
  padding: 12px;
  border: 1px solid ${props => props.isDropTarget ? '#0061d5' : '#e8e8e8'};
  border-radius: 8px;
  background: ${props => {
    if (props.isDragging) return '#f8f9fa';
    if (props.isDropTarget) return '#f0f9ff';
    return 'white';
  }};
  cursor: pointer;
  transition: all 0.2s;
  transform: ${props => props.isDragging ? 'scale(1.02)' : 'none'};
  box-shadow: ${props => props.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'};
  position: relative;

  &:hover {
    border-color: #0061d5;
    box-shadow: 0 0 0 1px #0061d5;
  }

  /* Rest of your existing FileItem styles... */

  .icon {
    /* Existing icon styles... */
  }

  .info {
    /* Existing info styles... */
  }

  /* Add hover state for the menu button */
  &:hover {
    .MuiIconButton-root {
      opacity: 1;
    }
  }
`;

export default Documents;
