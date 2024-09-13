import { Box, Typography, Stack, Autocomplete, TextField,InputAdornment, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const EquipmentHeader = ({ equipmentList, isFocused, setIsFocused, searchTerm, setSearchTerm, t }) => (
<>
<Stack direction="row" alignItems="center" justifyContent="space-between" paddingX={2} paddingY={1}>
    <Typography variant="h4" color="text.primary" fontWeight="bold">
    {t("Equipment")}
    </Typography>

    <Autocomplete
    freeSolo
    disableClearable
    options={equipmentList.map((option) => option.name)}
    onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
    }}
    ListboxProps={{
        component: 'div',
        sx: {
        backgroundColor: 'background.default',
        color: 'text.primary',
        }
    }}
    renderInput={(params) => (
        <TextField
        {...params}
        variant="outlined"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        sx={{
            paddingY: 1,
            width: isFocused ? '100%' : `${Math.max(searchTerm.length, 0) + 5}ch`,
            transition: 'width 0.3s',
            marginLeft: 'auto', // This keeps it aligned to the right
            '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'background.default',
            },
            '&:hover fieldset': {
                borderColor: 'text.primary',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'text.primary',
            },
            },
            '& .MuiInputBase-input': {
            color: 'text.primary',
            },
        }}
        InputProps={{
            startAdornment: (
            <InputAdornment position="start">
                <SearchIcon style={{ color: 'text.primary' }} />
            </InputAdornment>
            ),
        }}
        InputLabelProps={{
            style: { color: 'text.primary', width: '100%', textAlign: 'center' },
        }}
        />

    )}
    />
    </Stack>

    <Divider />
    <Box height={25}></Box>
    
</>
);

export default EquipmentHeader;