import { Button, Card, CardActions, CardContent, Container, Grid, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUser } from '../api';
import { AppBarHeader, DialogAction, Snackbars } from '../components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addNote, listAllNotes, removeNote, removeOneNote, selectNotes, updateNote } from '../store/modules/NoteSlice';
import { setMessage } from '../store/modules/SnackBarsSlice';
import { NoteEditType, NoteType } from '../types';
import NoteDeleteActionType from '../types/NoteDeleteActionType';
import NoteDeleteType from '../types/NoteDeleteType';
import NoteEditActionType from '../types/NoteEditActionType';

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const noteData = useAppSelector(selectNotes);

  const veirfyUser = async () => {
    const user = localStorage.getItem('ReccadosLoggedUser') || sessionStorage.getItem('ReccadosLoggedUser') || '';
    const result = await listUser(user);
    if (!result.ok) {
      localStorage.removeItem('ReccadosLoggedUser');
      sessionStorage.removeItem('ReccadosLoggedUser');
      return navigate('/');
    }
  };

  const loggedUser = () => {
    return localStorage.getItem('ReccadosLoggedUser') || sessionStorage.getItem('ReccadosLoggedUser') || '';
  };

  const loggedUserName = () => {
    return localStorage.getItem('ReccadosLoggedName') || sessionStorage.getItem('ReccadosLoggedName') || '';
  };

  useEffect(() => {
    if (loggedUser() === '') {
      return navigate('/');
    }
    veirfyUser();
    dispatch(listAllNotes(loggedUser()));
  }, [dispatch]);

  const [note, setNote] = useState<NoteType>({
    detail: '',
    description: ''
  });

  const HandleLogout = () => {
    localStorage.removeItem('ReccadosLoggedUser');
    sessionStorage.removeItem('ReccadosLoggedUser');
    navigate('/');
  };

  const HandleAddNote = async () => {
    if (note.detail === '' || note.description === '') {
      return dispatch(setMessage({ message: 'Digite algo nos campos!', status: 'error' }));
    }

    if (note.detail.length > 20) {
      return dispatch(
        setMessage({ message: 'Você ultrapassou o limite de 20 caracteres nos detalhes!', status: 'error' })
      );
    }
    if (note.description.length > 494) {
      return dispatch(
        setMessage({ message: 'Você ultrapassou o limite de 494 caracteres na descrição!', status: 'error' })
      );
    }
    const newNote: NoteType = {
      userid: loggedUser(),
      detail: note.detail,
      description: note.description
    };

    dispatch(addNote(newNote));
    HandleClearNotes();
  };

  const HandleClearNotes = () => {
    setNote({
      detail: '',
      description: ''
    });
  };

  const handleEditConfirm = async (noteToEdit: NoteEditActionType) => {
    const dispatchEdit: NoteEditType = {
      userid: loggedUser(),
      id: noteToEdit.id,
      detail: noteToEdit.detail,
      description: noteToEdit.description
    };
    const result = await dispatch(updateNote(dispatchEdit)).unwrap();
    if (result.ok) {
      return dispatch(setMessage({ message: 'Recado editado com sucesso!', status: 'success' }));
    }
    dispatch(setMessage({ message: 'Recado não foi editado.', status: 'error' }));
  };

  const handleToFileConfirm = async (noteToEdit: NoteEditActionType) => {
    const dispatchEdit: NoteEditType = {
      userid: loggedUser(),
      id: noteToEdit.id,
      detail: noteToEdit.detail,
      description: noteToEdit.description,
      arquived: noteToEdit.arquived
    };
    const result = await dispatch(updateNote(dispatchEdit)).unwrap();
    if (!result.ok) {
      dispatch(setMessage({ message: 'Recado não foi arquivado!', status: 'error' }));
      return;
    }
    dispatch(removeOneNote(noteToEdit.id));
    dispatch(setMessage({ message: 'Recado arquivado com sucesso!', status: 'success' }));
  };

  const handleDeleteConfirm = (noteToDelete: NoteDeleteActionType) => {
    const dispatchDelete: NoteDeleteType = {
      id: noteToDelete.id,
      userid: loggedUser()
    };
    dispatch(removeNote(dispatchDelete));
  };

  return (
    <React.Fragment>
      <AppBarHeader
        titleHeader={'Reccados'}
        actionLogout={HandleLogout}
        logedUser={loggedUserName()}
        noteArquivedLength={noteData.length}
        noteLength={noteData.length}
      />
      <Container maxWidth={false} sx={{ backgroundColor: '#ebeeef', height: 'auto', paddingBottom: '10px' }}>
        <Grid container rowSpacing={1} columnSpacing={2}>
          <Snackbars />
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label="Detalhes"
              inputProps={{ maxLength: 20 }}
              value={note.detail}
              onChange={ev => {
                setNote({
                  detail: ev.target.value,
                  description: note.description
                });
              }}
              variant="filled"
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descrição"
              inputProps={{ maxLength: 494 }}
              value={note.description}
              onChange={ev => {
                setNote({
                  detail: note.detail,
                  description: ev.target.value
                });
              }}
              variant="filled"
            />
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="contained" color="success" onClick={HandleAddNote}>
              SALVAR
            </Button>
          </Grid>
          <Grid item xs={6} sx={{ mb: '20px' }}>
            <Button fullWidth variant="contained" onClick={HandleClearNotes}>
              LIMPAR
            </Button>
          </Grid>
          {noteData
            .filter(note => note.arquived === false)
            .slice(0)
            .reverse()
            .map(item => (
              <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ maxHeight: 430 }}>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={`Detalhes: ${item.detail}`}
                    >
                      {item.detail}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minHeight: '282.66px', wordWrap: 'break-word' }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <DialogAction
                      actionEdit={handleEditConfirm}
                      actionToFile={handleToFileConfirm}
                      actionDelete={handleDeleteConfirm}
                      Note={item}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Notes;
