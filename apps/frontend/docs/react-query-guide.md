# React Query Guide

## 1. 기본 규칙

| 상황        | Hook          |
| ----------- | ------------- |
| 데이터 조회 | `useQuery`    |
| 데이터 생성 | `useMutation` |
| 데이터 수정 | `useMutation` |
| 데이터 삭제 | `useMutation` |

---

## 2. 예시 (파일 API)

| API            | Hook          |
| -------------- | ------------- |
| 파일 업로드    | `useMutation` |
| 파일 삭제      | `useMutation` |
| 파일 수정      | `useMutation` |
| 파일 목록 조회 | `useQuery`    |
| 파일 다운로드  | `useQuery`    |

---

## 3. 서버 상태 변경 요청 (POST → mutation)

```ts
apiClient.post('/files', form);
```

```ts
useMutation({
  mutationFn: uploadFiles,

  // 업로드 후 캐시 갱신
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['files'],
    });
  },
});
```

---

## 4. 데이터 조회 요청 (GET → query)

```ts
apiClient.get('/files');
```

```ts
useQuery({
  queryKey: ['files'],
  queryFn: getFiles,
});
```

---

## 5. queryKey 규칙

queryKey는 **리소스 기준으로 배열 형태로 작성한다.**

예:

```text
['files']
['files', fileId]
['files', 'detail', fileId]
['files', 'list', params]

['users']
['users', userId]
```

---

## 6. 기본 원칙

- `GET` 요청 → `useQuery`
- `POST / PUT / PATCH / DELETE` → `useMutation`
- 데이터 변경 후에는 `invalidateQueries`로 캐시 갱신
