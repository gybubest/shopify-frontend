import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components'
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Nominations from './components/Nominations';
import Alert from './components/Alert';

function App() {
  const apiKey = process.env.REACT_APP_APIKEY;

  const [result, setResult] = useState({keyWord: '', movieList: []});
  const [nominations, setNominations] = useState(JSON.parse(localStorage.getItem('nominationsInLocalStorage')) || []);
  const [showAlert, setShowAlert] = useState({show: false, message: ''});

  useEffect(() => {
    localStorage.setItem('nominationsInLocalStorage', JSON.stringify(nominations));
  }, [nominations]);

  const handleSearch = input => {
    const nominatedTitles = nominations.map(item => item.Title);
    const i = input.trim();

    if (i) {
      axios.get(`https://www.omdbapi.com/?apikey=${apiKey}&s=${i}&type=movie`)
      .then(res => {
        if (res.data.Response) {
          const filtered = res.data.Search.map(item => {
            return ({
              ...item,
              'nominated': nominatedTitles.includes(item.Title) ? true : false
            })
          });
    
          setResult({ keyWord: i, movieList: filtered }); 
        } 
      })
      .catch(error => {
        setShowAlert({show: true, message: 'Not found, please try another one.'});
      });
    }
  }; 

  const onNominate = id => {
    if (nominations.length < 5) {
      const newMovieList = result.movieList.map(item => {
        if (item.imdbID === id) {
          return {...item, 'nominated': true};
        }
        return item;
      });
  
      setResult({...result, movieList: newMovieList});
  
      const newNomination = result.movieList.filter(item => item.imdbID === id)[0];
      setNominations([...nominations, newNomination]);
    } else {
      setShowAlert({show: true, message: 'You already have 5 nominees!'});
    }

  };

  const onRemove = id => {
    const newNominationList = nominations.filter(item => item.imdbID !== id);
    setNominations(newNominationList);

    const newMovieList = result.movieList.map(item => {
      if (item.imdbID === id) {
        return {...item, 'nominated': false};
      }
      return item;
    });

    setResult({...result, movieList: newMovieList});
  };

  return (
    <Wrapper>
      <Header>
          <h1>
            The Shoppies
          </h1>
          <SearchBar
            handleSearch={handleSearch}
          />
      </Header>
      <Main>
      {showAlert.show && 
        <AlertContainer>
            <Alert
              onClose={() => setShowAlert({show: false, message: ''})}
              showAlert={showAlert}
            />
        </AlertContainer>
      }
        <MovieContainer>
          <SearchResults
            keyWord={result.keyWord}
            movieList={result.movieList}
            onNominate={onNominate}
          />
          <Nominations
            movieList={nominations}
            onRemove={onRemove}
          />
        </MovieContainer>
      </Main>
    </Wrapper>
  );
}

export default App;

const Wrapper = styled.div`
  margin: 5%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4vh;
`;

const AlertContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 4vh;
`;

const MovieContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;